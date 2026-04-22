/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs block on the adventures listing page.
 * Each tab panel contains an image-list (card grid) that should be
 * converted to a cards-article block embedded within the tab content.
 *
 * DOM selector: .cmp-tabs (on adventures listing)
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

    // Column 2: content group
    const contentCell = document.createDocumentFragment();

    // content_heading
    contentCell.appendChild(document.createComment(' field:content_heading '));
    const h3 = document.createElement('h3');
    h3.textContent = label;
    contentCell.appendChild(h3);

    if (panels[i]) {
      const imageList = panels[i].querySelector('.cmp-image-list');
      if (imageList) {
        // Build a cards-article block from the image list items
        const items = imageList.querySelectorAll('.cmp-image-list__item');
        const cardCells = [];

        items.forEach((item) => {
          const img = item.querySelector('img');
          const imageCell = document.createDocumentFragment();
          imageCell.appendChild(document.createComment(' field:image '));
          if (img) {
            const picture = document.createElement('picture');
            const newImg = document.createElement('img');
            newImg.src = img.src;
            newImg.alt = img.alt || '';
            picture.appendChild(newImg);
            imageCell.appendChild(picture);
          }

          const textCell = document.createDocumentFragment();
          textCell.appendChild(document.createComment(' field:text '));
          const titleEl = item.querySelector(
            '.cmp-image-list__item-title',
          );
          const titleLink = item.querySelector(
            '.cmp-image-list__item-title-link',
          );
          if (titleEl) {
            const p = document.createElement('p');
            if (titleLink) {
              const a = document.createElement('a');
              a.href = titleLink.href;
              a.textContent = titleEl.textContent.trim();
              const strong = document.createElement('strong');
              strong.appendChild(a);
              p.appendChild(strong);
            } else {
              const strong = document.createElement('strong');
              strong.textContent = titleEl.textContent.trim();
              p.appendChild(strong);
            }
            textCell.appendChild(p);
          }

          const desc = item.querySelector(
            '.cmp-image-list__item-description',
          );
          if (desc) {
            const p = document.createElement('p');
            p.textContent = desc.textContent.trim();
            textCell.appendChild(p);
          }

          cardCells.push([imageCell, textCell]);
        });

        const cardsBlock = WebImporter.Blocks.createBlock(
          document,
          { name: 'cards-article', cells: cardCells },
        );
        contentCell.appendChild(
          document.createComment(' field:content_richtext '),
        );
        contentCell.appendChild(cardsBlock);
      }
    }

    cells.push([titleCell, contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(
    document,
    { name: 'tabs', cells },
  );
  element.replaceWith(block);
}
