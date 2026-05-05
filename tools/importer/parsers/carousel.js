/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel variant.
 * Base block: carousel (container block with carousel-slide items)
 * Source: https://wknd.site/us/en.html
 * UE Model: carousel-item (fields: media_image, media_imageAlt [collapsed], content_text)
 * Generated: 2026-05-03
 */
export default function parse(element, { document }) {
  // Get all carousel slide items
  const slides = element.querySelectorAll('.cmp-carousel__item');

  const cells = [];

  slides.forEach((slide) => {
    // Extract image from the teaser image area
    const image = slide.querySelector('.cmp-teaser__image img, .cmp-image__image, img');

    // Extract text content: title (heading), description, and CTA links
    const title = slide.querySelector('.cmp-teaser__title, h2, h1, h3, [class*="title"]');
    const description = slide.querySelector('.cmp-teaser__description, [class*="description"]');
    const ctaLinks = Array.from(slide.querySelectorAll('.cmp-teaser__action-link, .cmp-teaser__action-container a'));

    // Build the media cell (field group: media_image, media_imageAlt is collapsed)
    const mediaCell = document.createDocumentFragment();
    mediaCell.appendChild(document.createComment(' field:media_image '));
    if (image) {
      mediaCell.appendChild(image);
    }

    // Build the content cell (field: content_text - richtext containing heading, description, CTA)
    const contentCell = document.createDocumentFragment();
    contentCell.appendChild(document.createComment(' field:content_text '));
    if (title) {
      contentCell.appendChild(title);
    }
    if (description) {
      contentCell.appendChild(description);
    }
    ctaLinks.forEach((link) => {
      const p = document.createElement('p');
      p.appendChild(link);
      contentCell.appendChild(p);
    });

    // Each slide is a row with two columns: [media, content]
    cells.push([mediaCell, contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel', cells });
  element.replaceWith(block);
}
