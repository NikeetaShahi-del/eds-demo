/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-adventure variant.
 * Base block: tabs
 * Source: https://wknd.site/us/en/adventures.html
 * DOM selector: .tabs.panelcontainer
 * Generated: 2026-05-13
 *
 * Structure: Tabbed adventure listing with category tabs (All, Climbing, Cycling,
 * Skiing, Surfing, Travel). Each tab panel contains an image-list of adventure
 * cards with image, title link, and description.
 *
 * UE Model: tabs-item (container block item)
 * Fields (column mapping):
 *   Column 1 -> title (text) - plain text tab label
 *   Column 2 -> content group:
 *     - content_heading (text) + content_headingType (select, collapsed) - heading element
 *     - content_image (reference, single) - first image from panel
 *     - content_richtext (richtext) - adventure card listings as rich text
 */
export default function parse(element, { document }) {
  const tabsEl = element.querySelector('.cmp-tabs') || element;

  // Extract tab labels from the tablist
  const tabs = tabsEl.querySelectorAll('.cmp-tabs__tablist > .cmp-tabs__tab');
  // Fallback: try direct .cmp-tabs__tab if tablist wrapper is missing
  const tabButtons = tabs.length > 0
    ? tabs
    : tabsEl.querySelectorAll('.cmp-tabs__tab');

  // Extract tab panels
  const panels = tabsEl.querySelectorAll(':scope > .cmp-tabs__tabpanel');
  // Fallback: try without :scope if needed
  const tabPanels = panels.length > 0
    ? panels
    : tabsEl.querySelectorAll('.cmp-tabs__tabpanel');

  const cells = [];

  tabButtons.forEach((tab, i) => {
    const label = tab.textContent.trim();

    // Column 1: title (text field) with field hint
    const titleCell = document.createDocumentFragment();
    titleCell.appendChild(document.createComment(' field:title '));
    const titleP = document.createElement('p');
    titleP.textContent = label;
    titleCell.appendChild(titleP);

    // Column 2: content group (content_heading, content_image, content_richtext)
    const contentCell = document.createDocumentFragment();

    // content_heading - use tab label as heading (content_headingType is collapsed)
    contentCell.appendChild(document.createComment(' field:content_heading '));
    const h3 = document.createElement('h3');
    h3.textContent = label;
    contentCell.appendChild(h3);

    if (tabPanels[i]) {
      const panel = tabPanels[i];

      // Extract adventure cards from the image-list within this panel
      const imageList = panel.querySelector('.cmp-image-list');
      if (imageList) {
        const items = imageList.querySelectorAll('.cmp-image-list__item');

        if (items.length > 0) {
          // content_image - first adventure image from the panel
          const firstImg = items[0].querySelector('img');
          if (firstImg) {
            contentCell.appendChild(document.createComment(' field:content_image '));
            const picture = document.createElement('picture');
            const newImg = document.createElement('img');
            newImg.src = firstImg.src;
            newImg.alt = firstImg.alt || '';
            picture.appendChild(newImg);
            contentCell.appendChild(picture);
          }

          // content_richtext - build adventure listings as rich text content
          contentCell.appendChild(document.createComment(' field:content_richtext '));

          items.forEach((item) => {
            const titleLink = item.querySelector('.cmp-image-list__item-title-link');
            const titleEl = item.querySelector('.cmp-image-list__item-title');
            const desc = item.querySelector('.cmp-image-list__item-description');

            // Adventure title as linked bold text
            if (titleEl) {
              const p = document.createElement('p');
              if (titleLink) {
                const a = document.createElement('a');
                a.href = titleLink.href || titleLink.getAttribute('href') || '#';
                a.textContent = titleEl.textContent.trim();
                const strong = document.createElement('strong');
                strong.appendChild(a);
                p.appendChild(strong);
              } else {
                const strong = document.createElement('strong');
                strong.textContent = titleEl.textContent.trim();
                p.appendChild(strong);
              }
              contentCell.appendChild(p);
            }

            // Adventure description
            if (desc) {
              const descP = document.createElement('p');
              descP.textContent = desc.textContent.trim();
              contentCell.appendChild(descP);
            }
          });
        }
      }
    }

    cells.push([titleCell, contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-adventure', cells });
  element.replaceWith(block);
}
