/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-featured. Base: hero. Source: https://wknd.site/us/en.html
 * Model: hero-featured (simple block)
 * Fields: image (reference), imageAlt (text, collapsed), text (richtext)
 * Library structure: 1 column, row1=image, row2=text content
 */
export default function parse(element, { document }) {
  // Row 1: Background image with field hint
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

  // Row 2: Text content (pretitle + heading + description + CTA) with field hint
  const textCell = document.createDocumentFragment();
  textCell.appendChild(document.createComment(' field:text '));

  const pretitle = element.querySelector('.cmp-teaser__pretitle');
  if (pretitle) {
    const p = document.createElement('p');
    p.textContent = pretitle.textContent.trim();
    textCell.appendChild(p);
  }

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

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-featured', cells });
  element.replaceWith(block);
}
