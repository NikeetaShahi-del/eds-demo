/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs block.
 * DOM selector: .tabs.panelcontainer, .cmp-tabs
 *
 * Model: tabs-item (container block item)
 * Fields (column mapping):
 *   Column 1 → title (text) — plain text tab label
 *   Column 2 → content group:
 *     - content_heading (text) + content_headingType (select) → first heading element (h3-h6)
 *     - content_image (reference, single) → first image only
 *     - content_richtext (richtext) → remaining text/list content
 */
export default function parse(element, { document }) {
  const tabsEl = element.querySelector('.cmp-tabs') || element;
  const tabs = tabsEl.querySelectorAll('.cmp-tabs__tab');
  const panels = tabsEl.querySelectorAll('.cmp-tabs__tabpanel');
  const cells = [];

  tabs.forEach((tab, i) => {
    const label = tab.textContent.trim();

    // Column 1: title — plain text only
    const titleCell = document.createDocumentFragment();
    const titleP = document.createElement('p');
    titleP.textContent = label;
    titleCell.appendChild(titleP);

    // Column 2: content group — ordered to match content_* fields
    const contentCell = document.createDocumentFragment();
    if (panels[i]) {
      // 1. content_heading + content_headingType: first heading element
      const heading = panels[i].querySelector('h3, h4, h5, h6');
      if (heading) {
        const h = document.createElement(heading.tagName.toLowerCase());
        h.textContent = heading.textContent.trim();
        contentCell.appendChild(h);
      } else {
        const h3 = document.createElement('h3');
        h3.textContent = label;
        contentCell.appendChild(h3);
      }

      // 2. content_image: single image only (multi: false)
      const firstImg = panels[i].querySelector('img');
      if (firstImg) {
        const picture = document.createElement('picture');
        const newImg = document.createElement('img');
        newImg.src = firstImg.src;
        newImg.alt = firstImg.alt || '';
        picture.appendChild(newImg);
        contentCell.appendChild(picture);
      }

      // 3. content_richtext: remaining text content (paragraphs, lists)
      const textElements = panels[i].querySelectorAll('p, ul, ol');
      textElements.forEach((el) => {
        // Skip paragraphs that only contain an image
        if (el.tagName === 'P') {
          const imgs = el.querySelectorAll('img');
          if (imgs.length > 0 && el.textContent.trim() === '') return;
        }
        const clone = el.cloneNode(true);
        // Remove images from cloned text elements (already handled above)
        clone.querySelectorAll('img, picture').forEach((img) => img.remove());
        if (clone.textContent.trim()) {
          contentCell.appendChild(clone);
        }
      });
    }

    cells.push([titleCell, contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs', cells });
  element.replaceWith(block);
}
