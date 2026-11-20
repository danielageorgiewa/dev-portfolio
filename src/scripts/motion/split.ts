// Text splitting for letter and word effects. Both keep the text readable by screen readers
// and both can be undone, which puts the original nodes back.

export interface Split {
  parts: HTMLElement[];
  revert(): void;
}

/**
 * Splits an element that holds plain text into one inline-block span per character.
 * The full word stays available to screen readers in a visually hidden span; the letters
 * are aria-hidden. Kerning lost by splitting is put back as em margins, so the word keeps
 * the exact width and letter positions it had as plain text.
 */
export function splitChars(el: HTMLElement): Split {
  const text = el.textContent ?? '';
  const node = el.firstChild;
  const original = Array.from(el.childNodes).map((n) => n.cloneNode(true));
  const chars = Array.from(text);
  const fontSize = parseFloat(getComputedStyle(el).fontSize) || 16;

  // Natural x of every character, measured on the unsplit text.
  const natural: number[] = [];
  if (node && node.nodeType === Node.TEXT_NODE && el.childNodes.length === 1) {
    const range = document.createRange();
    let offset = 0;
    for (const ch of chars) {
      range.setStart(node, offset);
      range.setEnd(node, offset + ch.length);
      natural.push(range.getBoundingClientRect().left);
      offset += ch.length;
    }
  }

  const sr = document.createElement('span');
  sr.className = 'visually-hidden';
  sr.textContent = text;
  const visual = document.createElement('span');
  visual.setAttribute('aria-hidden', 'true');
  const parts = chars.map((ch) => {
    const span = document.createElement('span');
    span.textContent = ch;
    span.style.display = 'inline-block';
    if (ch.trim() === '') span.style.whiteSpace = 'pre';
    visual.append(span);
    return span;
  });
  el.replaceChildren(sr, visual);

  if (natural.length === parts.length) {
    const split = parts.map((p) => p.getBoundingClientRect().left);
    for (let i = 1; i < parts.length; i++) {
      const kern = natural[i] - natural[i - 1] - (split[i] - split[i - 1]);
      if (Math.abs(kern) > 0.01) parts[i].style.marginLeft = `${(kern / fontSize).toFixed(4)}em`;
    }
  }

  return { parts, revert: () => el.replaceChildren(...original) };
}

/**
 * Wraps every word under `el` in an inline span (nested elements such as <em> are kept).
 * The spans stay inline, so line breaks, kerning and the accessible text do not change.
 */
export function splitWords(el: HTMLElement): Split {
  const original = Array.from(el.childNodes).map((n) => n.cloneNode(true));
  const parts: HTMLElement[] = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text);
  for (const node of textNodes) {
    const frag = document.createDocumentFragment();
    for (const piece of (node.nodeValue ?? '').split(/(\s+)/)) {
      if (piece === '') continue;
      if (/^\s+$/.test(piece)) {
        frag.append(piece);
      } else {
        const span = document.createElement('span');
        span.textContent = piece;
        parts.push(span);
        frag.append(span);
      }
    }
    node.replaceWith(frag);
  }
  return { parts, revert: () => el.replaceChildren(...original) };
}
