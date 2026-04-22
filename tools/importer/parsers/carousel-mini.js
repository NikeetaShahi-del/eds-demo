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
    if (img) {
      const picture = document.createElement('picture');
      const newImg = document.createElement('img');
      newImg.src = img.src;
      newImg.alt = img.alt || '';
      picture.appendChild(newImg);
      imageCell.appendChild(picture);
    }
    cells.push([imageCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel', cells });
  element.replaceWith(block);
}
