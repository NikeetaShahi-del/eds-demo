/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-article. Base: cards. Source: https://wknd.site/us/en.html
 * Model: card (container block)
 * Fields: image (reference), text (richtext)
 * Library structure: 2 columns per row — image in col1, text in col2
 * DOM selector: .image-list.list (matches both article and adventure card lists)
 */
export default function parse(element, { document }) {
  const items = element.querySelectorAll('.cmp-image-list__item');
  const cells = [];

  items.forEach((item) => {
    // Column 1: Image with field hint
    const img = item.querySelector('.cmp-image-list__item-image img, .cmp-image__image');
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

    // Column 2: Text content (title + description + link) with field hint
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));

    const titleEl = item.querySelector('.cmp-image-list__item-title');
    const titleLink = item.querySelector('.cmp-image-list__item-title-link');
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

    const desc = item.querySelector('.cmp-image-list__item-description');
    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc.textContent.trim();
      textCell.appendChild(p);
    }

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-article', cells });
  element.replaceWith(block);
}
