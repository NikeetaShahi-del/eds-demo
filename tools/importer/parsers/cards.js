/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards variant.
 * Base block: cards
 * Source selector: .image-list.list
 * UE Model: container block with child "card" items (fields: image, text)
 * Generated: 2026-05-03
 *
 * Source HTML structure:
 *   div.image-list.list
 *     ul.cmp-image-list
 *       li.cmp-image-list__item (repeated per card)
 *         article.cmp-image-list__item-content
 *           a.cmp-image-list__item-image-link > div.cmp-image-list__item-image > div.cmp-image > img.cmp-image__image
 *           a.cmp-image-list__item-title-link > span.cmp-image-list__item-title
 *           span.cmp-image-list__item-description
 *
 * Target table (from block library):
 *   | Cards                                |
 *   | card | image | title + description   |
 *   | card | image | title + description   |
 *   ...
 *
 * Each row = one card with 2 columns:
 *   Column 1: image (field: image)
 *   Column 2: title (bold/heading) + description + optional CTA (field: text)
 */
export default function parse(element, { document }) {
  // Find all card items from the source list
  const cardItems = element.querySelectorAll('.cmp-image-list__item');

  const cells = [];

  cardItems.forEach((item) => {
    // --- Column 1: Image with field hint ---
    const img = item.querySelector('img.cmp-image__image, img');
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(' field:image '));
    if (img) {
      const newImg = document.createElement('img');
      newImg.src = img.src || img.getAttribute('src');
      if (img.alt) newImg.alt = img.alt;
      imageCell.appendChild(newImg);
    }

    // --- Column 2: Text content (title + description + optional link) with field hint ---
    const titleSpan = item.querySelector('.cmp-image-list__item-title, span[class*="title"]');
    const descriptionSpan = item.querySelector('.cmp-image-list__item-description, span[class*="description"]');
    const titleLink = item.querySelector('a.cmp-image-list__item-title-link, a[class*="title-link"]');

    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));

    // Title as bold text (matching library example pattern)
    if (titleSpan) {
      const strong = document.createElement('strong');
      strong.textContent = titleSpan.textContent.trim();

      // If there is a title link, wrap the bold title in a link
      if (titleLink && titleLink.getAttribute('href')) {
        const link = document.createElement('a');
        link.href = titleLink.getAttribute('href');
        link.appendChild(strong);
        const p = document.createElement('p');
        p.appendChild(link);
        textCell.appendChild(p);
      } else {
        const p = document.createElement('p');
        p.appendChild(strong);
        textCell.appendChild(p);
      }
    }

    // Description text
    if (descriptionSpan) {
      const descText = descriptionSpan.textContent.trim();
      if (descText) {
        const p = document.createElement('p');
        p.textContent = descText;
        textCell.appendChild(p);
      }
    }

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
