/*
 * <image-slot> — image placeholder element used by the mock portal pages.
 *
 * The element fills its parent box and renders `src` cropped to cover.
 * With no `src` it draws a neutral panel with the `placeholder` label,
 * so an unfilled slot is visible rather than collapsed.
 *
 * Attributes:
 *   src          image URL; when absent the placeholder panel is drawn
 *   placeholder  label shown on the placeholder panel
 *   shape        "rect" (default) | "circle"
 *   id           slot identifier, not used for rendering
 */
(function () {
  if (customElements.get('image-slot')) return;

  class ImageSlot extends HTMLElement {
    static get observedAttributes() { return ['src', 'placeholder', 'shape']; }

    connectedCallback() { this.render(); }
    attributeChangedCallback() { if (this.isConnected) this.render(); }

    render() {
      const src = this.getAttribute('src');
      const label = this.getAttribute('placeholder') || '';
      const round = this.getAttribute('shape') === 'circle';

      this.style.display = 'block';
      this.style.width = '100%';
      this.style.height = '100%';
      this.style.overflow = 'hidden';
      this.style.borderRadius = round ? '50%' : '';

      if (src) {
        const img = this.firstElementChild instanceof HTMLImageElement
          ? this.firstElementChild
          : null;
        const el = img || document.createElement('img');
        el.style.cssText =
          'display:block;width:100%;height:100%;object-fit:cover;object-position:center';
        el.alt = label;
        el.loading = 'lazy';
        el.decoding = 'async';
        if (el.getAttribute('src') !== src) el.setAttribute('src', src);
        if (!img) { this.textContent = ''; this.appendChild(el); }
        return;
      }

      this.textContent = '';
      const panel = document.createElement('div');
      panel.style.cssText =
        'display:flex;align-items:center;justify-content:center;width:100%;height:100%;' +
        'padding:12px;box-sizing:border-box;background:#F1F4F6;color:#8B98A3;' +
        'font:400 12px/1.4 Manrope,system-ui,sans-serif;text-align:center';
      panel.textContent = label;
      this.appendChild(panel);
    }
  }

  customElements.define('image-slot', ImageSlot);
})();
