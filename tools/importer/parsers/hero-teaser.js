/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero teaser blocks (used on adventures listing, magazine listing).
 * DOM selector: .teaser:not(.cmp-teaser--featured):not(.cmp-teaser--hero):not(.cmp-teaser--list)
 */
export default function parse(element, { document }) {
  const img = element.querySelector('.cmp-teaser__image img, .cmp-image__image');
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
  const heading = element.querySelector('.cmp-teaser__title');
  if (heading) {
    const h2 = document.createElement('h2');
    h2.textContent = heading.textContent.trim();
    textCell.appendChild(h2);
  }

  const desc = element.querySelector('.cmp-teaser__description');
  if (desc) {
    const p = document.createElement('p');
    p.textContent = desc.textContent.trim();
    textCell.appendChild(p);
  }

  const cta = element.querySelector('.cmp-teaser__action-link');
  if (cta) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = cta.href;
    a.textContent = cta.textContent.trim();
    p.appendChild(a);
    textCell.appendChild(p);
  }

  const cells = [
    [imageCell],
    [textCell],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
