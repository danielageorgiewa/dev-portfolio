#!/usr/bin/env node
// One-time Google sign-in for the booking functions.
//
//   node scripts/google-auth.mjs              print the refresh token
//   node scripts/google-auth.mjs --write-env  also save it to .env (git-ignored)
//   node scripts/google-auth.mjs --port 5000  use another port (must match the redirect URI)
//
// Reads GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET from the environment or from .env, opens
// Google's consent page in the browser, receives the answer on http://127.0.0.1:<port>, and
// swaps it for a refresh token. Nothing is sent anywhere except to Google, and the token is
// only printed in this terminal unless --write-env is given. See README.md, "Google setup".

import { spawn } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { chmodSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ENV_FILE = resolve(ROOT, '.env');
const DEFAULT_PORT = 53682;
const CALLBACK_PATH = '/oauth2callback';
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.freebusy',
];
const TIMEOUT_MS = 5 * 60_000;

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(
    'Usage: node scripts/google-auth.mjs [--write-env] [--port <number>]\n\n' +
      'Needs GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in the environment or in .env.\n' +
      `The OAuth client must list http://127.0.0.1:${DEFAULT_PORT}${CALLBACK_PATH} as a redirect URI.`,
  );
  process.exit(0);
}
const writeEnv = args.includes('--write-env');
const portArg = args.indexOf('--port');
const port = portArg === -1 ? DEFAULT_PORT : Number(args[portArg + 1]);
if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  fail('--port needs a number between 1024 and 65535.');
}

function fail(message) {
  console.error(`\n${message}\n`);
  process.exit(1);
}

/** A small .env reader: KEY=value lines, optional quotes, # comments. */
function readEnvFile(file) {
  const out = {};
  if (!existsSync(file)) return out;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line);
    if (!match) continue;
    let value = match[2];
    const quoted = /^(['"])(.*)\1$/.exec(value);
    if (quoted) value = quoted[2];
    else value = value.replace(/\s+#.*$/, '');
    out[match[1]] = value;
  }
  return out;
}

const fileEnv = readEnvFile(ENV_FILE);
const clientId = (process.env.GOOGLE_CLIENT_ID || fileEnv.GOOGLE_CLIENT_ID || '').trim();
const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || fileEnv.GOOGLE_CLIENT_SECRET || '').trim();
if (!clientId || !clientSecret) {
  fail(
    'GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are not set.\n' +
      'Copy .env.example to .env, paste the two values from Google Cloud, and run this again.',
  );
}

const base64url = (buffer) => buffer.toString('base64url');
const redirectUri = `http://127.0.0.1:${port}${CALLBACK_PATH}`;
// `state` ties the answer to this run; PKCE ties the code to this process.
const state = base64url(randomBytes(24));
const verifier = base64url(randomBytes(48));
const challenge = base64url(createHash('sha256').update(verifier).digest());

const consentUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
consentUrl.search = new URLSearchParams({
  client_id: clientId,
  redirect_uri: redirectUri,
  response_type: 'code',
  scope: SCOPES.join(' '),
  access_type: 'offline',
  prompt: 'consent',
  state,
  code_challenge: challenge,
  code_challenge_method: 'S256',
}).toString();

function page(title, body) {
  return (
    '<!doctype html><meta charset="utf-8"><title>Google sign-in</title>' +
    '<body style="font:16px/1.5 system-ui,sans-serif;max-width:32rem;margin:15vh auto;padding:0 1rem">' +
    `<h1 style="font-size:1.25rem">${title}</h1><p>${body}</p></body>`
  );
}

async function exchange(code) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      code_verifier: verifier,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Google refused the code (${res.status} ${data.error ?? ''} ${data.error_description ?? ''}).`.trim());
  }
  return data;
}

function saveToken(token) {
  const line = `GOOGLE_REFRESH_TOKEN=${token}`;
  const current = existsSync(ENV_FILE) ? readFileSync(ENV_FILE, 'utf8') : '';
  const next = /^GOOGLE_REFRESH_TOKEN=.*$/m.test(current)
    ? current.replace(/^GOOGLE_REFRESH_TOKEN=.*$/m, line)
    : `${current}${current && !current.endsWith('\n') ? '\n' : ''}${line}\n`;
  writeFileSync(ENV_FILE, next, { mode: 0o600 });
  // `mode` only applies when the file is created. An existing .env keeps its old
  // permissions unless they are set here.
  chmodSync(ENV_FILE, 0o600);
}

function finish(server, code) {
  server.close();
  server.closeAllConnections?.();
  process.exitCode = code;
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', redirectUri);
  if (url.pathname !== CALLBACK_PATH) {
    res.writeHead(404, { 'content-type': 'text/plain' }).end('Not found');
    return;
  }
  const html = (status, title, body) =>
    res.writeHead(status, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' }).end(page(title, body));

  if (url.searchParams.get('state') !== state) {
    // Not the answer to this run's request. Keep waiting for the real one.
    html(400, 'That did not match', 'This page was not opened by the sign-in that is running. Go back to the terminal.');
    return;
  }
  const error = url.searchParams.get('error');
  const code = url.searchParams.get('code');
  if (error || !code) {
    html(400, 'Sign-in was not completed', 'You can close this tab and run the script again.');
    console.error(`\nGoogle did not grant access (${error ?? 'no code returned'}).\n`);
    finish(server, 1);
    return;
  }

  try {
    const tokens = await exchange(code);
    if (!tokens.refresh_token) {
      html(500, 'No refresh token', 'Google answered without a refresh token. See the terminal.');
      console.error(
        '\nGoogle did not send a refresh token. Remove this app at\n' +
          'https://myaccount.google.com/connections and run the script again.\n',
      );
      finish(server, 1);
      return;
    }
    html(200, 'Signed in', 'The refresh token is in the terminal. You can close this tab.');
    if (writeEnv) saveToken(tokens.refresh_token);
    console.log(
      '\nSigned in. Set these four variables in Netlify\n' +
        '(Site configuration > Environment variables), then trigger a new deploy:\n\n' +
        '  GOOGLE_CLIENT_ID       the client ID you already have\n' +
        '  GOOGLE_CLIENT_SECRET   the client secret you already have\n' +
        '  GOOGLE_CALENDAR_ID     the calendar to book into (your Google account email for the main calendar)\n' +
        `  GOOGLE_REFRESH_TOKEN   ${tokens.refresh_token}\n\n` +
        (writeEnv
          ? 'GOOGLE_REFRESH_TOKEN was also saved to .env (git-ignored).\n'
          : 'The token was not saved anywhere. Run again with --write-env to put it in .env.\n') +
        'Treat the refresh token like a password: with the client secret it can read, change and\n' +
        'delete events on this account\'s calendars, not only see busy times.\n',
    );
    finish(server, 0);
  } catch (err) {
    html(500, 'Something went wrong', 'See the terminal.');
    console.error(`\n${err instanceof Error ? err.message : 'The token exchange failed.'}\n`);
    finish(server, 1);
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    fail(`Port ${port} is in use. Close what is using it, or pass --port with a port whose redirect URI is registered.`);
  }
  fail(`Could not start the local server: ${err.message}`);
});

// Loopback only: nothing outside this computer can reach the callback.
server.listen(port, '127.0.0.1', () => {
  console.log(
    `\nWaiting for Google on ${redirectUri}\n\n` +
      'Opening the consent page in your browser. If it does not open, paste this address:\n\n' +
      `${consentUrl.href}\n`,
  );
  const opener =
    process.platform === 'darwin'
      ? ['open', [consentUrl.href]]
      : process.platform === 'win32'
        ? ['cmd', ['/c', 'start', '""', consentUrl.href.replace(/&/g, '^&')]]
        : ['xdg-open', [consentUrl.href]];
  if (!process.env.GOOGLE_AUTH_NO_OPEN) {
    try {
      spawn(opener[0], opener[1], { stdio: 'ignore', detached: true }).on('error', () => {}).unref();
    } catch {
      // The address is printed above.
    }
  }
});

setTimeout(() => {
  console.error('\nNo answer from Google after five minutes. Run the script again.\n');
  finish(server, 1);
}, TIMEOUT_MS).unref();
