/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-hero. Base: carousel. Source: https://wknd.site/us/en.html
 * Model: carousel-hero-item (container block)
 * Fields: media_image (reference), media_imageAlt (text, collapsed), content_text (richtext)
 * Library structure: 2 columns per row — image in col1, text content in col2
 */
export default function parse(element, { document }) {
  // Each slide is a .cmp-carousel__item containing a .cmp-teaser
  const slides = element.querySelectorAll('.cmp-carousel__item');
  const cells = [];

  slides.forEach((slide) => {
    const teaser = slide.querySelector('.cmp-teaser');
    if (!teaser) return;

    // Column 1: Image with field hint
    const img = teaser.querySelector('.cmp-teaser__image img, .cmp-image__image');
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

    // Column 2: Text content (heading + description + CTA) with field hint
    const contentCell = document.createDocumentFragment();
    contentCell.appendChild(document.createComment(' field:content_text '));

    const heading = teaser.querySelector('.cmp-teaser__title');
    if (heading) {
      const h2 = document.createElement('h2');
      h2.textContent = heading.textContent.trim();
      contentCell.appendChild(h2);
    }

    const desc = teaser.querySelector('.cmp-teaser__description');
    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc.textContent.trim();
      contentCell.appendChild(p);
    }

    const cta = teaser.querySelector('.cmp-teaser__action-link');
    if (cta) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = cta.href;
      a.textContent = cta.textContent.trim();
      p.appendChild(a);
      contentCell.appendChild(p);
    }

    cells.push([imageCell, contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-hero', cells });
  element.replaceWith(block);
}
