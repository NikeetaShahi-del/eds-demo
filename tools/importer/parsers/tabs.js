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

    // Column 1: title (text field)
    const titleCell = document.createDocumentFragment();
    titleCell.appendChild(document.createComment(' field:title '));
    const titleP = document.createElement('p');
    titleP.textContent = label;
    titleCell.appendChild(titleP);

    // Column 2: content group (content_heading, content_image, content_richtext)
    const contentCell = document.createDocumentFragment();
    if (panels[i]) {
      // content_heading + content_headingType (Type is collapsed into heading tag)
      contentCell.appendChild(document.createComment(' field:content_heading '));
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

      // content_image (single image)
      const firstImg = panels[i].querySelector('img');
      if (firstImg) {
        contentCell.appendChild(document.createComment(' field:content_image '));
        const picture = document.createElement('picture');
        const newImg = document.createElement('img');
        newImg.src = firstImg.src;
        newImg.alt = firstImg.alt || '';
        picture.appendChild(newImg);
        contentCell.appendChild(picture);
      }

      // content_richtext (remaining text)
      contentCell.appendChild(document.createComment(' field:content_richtext '));
      const textElements = panels[i].querySelectorAll('p, ul, ol');
      textElements.forEach((el) => {
        if (el.tagName === 'P') {
          const imgs = el.querySelectorAll('img');
          if (imgs.length > 0 && el.textContent.trim() === '') return;
        }
        const clone = el.cloneNode(true);
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
