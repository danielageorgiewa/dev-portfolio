// Copy buttons: <button data-copy="text" data-copy-done="Copied">Copy</button>.
// The label switches to the done text for two seconds, then back.
const SHOW_MS = 2000;

export function initCopy(): void {
  for (const button of document.querySelectorAll<HTMLButtonElement>('button[data-copy]')) {
    const label = button.textContent ?? '';
    let timer: number | undefined;
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copy ?? '');
      } catch {
        return; // Clipboard refused: the label stays, the text can still be selected.
      }
      button.textContent = button.dataset.copyDone ?? label;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        button.textContent = label;
      }, SHOW_MS);
    });
  }
}
