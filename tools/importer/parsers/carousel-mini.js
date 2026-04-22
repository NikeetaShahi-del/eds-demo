/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-mini (adventure detail image carousel).
 * DOM selector: .carousel.cmp-carousel--mini
 */
export default function parse(element, { document }) {
  const slides = element.querySelectorAll('.cmp-carousel__item');
  const cells = [];

  slides.forEach((slide) => {
    const img = slide.querySelector('img');
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(' field:media_image '));
    if (img) {
      const picture = document.createElement('picture');
      const newImg = document.createElement('img');
      newImg.src = img.src;
      newImg.alt = img.alt || '';
      picture.appendChild(newImg);
      imageCell.appendChild(picture);
    }

    const contentCell = document.createDocumentFragment();
    contentCell.appendChild(document.createComment(' field:content_text '));
    const p = document.createElement('p');
    p.textContent = img ? (img.alt || '') : '';
    contentCell.appendChild(p);

    cells.push([imageCell, contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel', cells });
  element.replaceWith(block);
}
