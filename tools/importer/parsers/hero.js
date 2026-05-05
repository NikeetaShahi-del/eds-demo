/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero variant.
 * Base block: hero
 * Source: https://wknd.site/us/en.html
 * Selectors: .teaser.cmp-teaser--featured, .teaser.cmp-teaser--hero.cmp-teaser--imagebottom
 * Project type: xwalk (field hints enabled)
 * UE Model fields: image (reference), imageAlt (collapsed), text (richtext)
 * Generated: 2026-05-03
 */
export default function parse(element, { document }) {
  // --- Extract image from source DOM ---
  const img = element.querySelector('.cmp-teaser__image img.cmp-image__image, .cmp-teaser__image img');

  // --- Extract text content from source DOM ---
  const pretitle = element.querySelector('p.cmp-teaser__pretitle');
  const heading = element.querySelector('h2.cmp-teaser__title, h1.cmp-teaser__title, h3.cmp-teaser__title');
  const description = element.querySelector('div.cmp-teaser__description, p.cmp-teaser__description');
  const ctaLinks = Array.from(element.querySelectorAll('.cmp-teaser__action-container a.cmp-teaser__action-link'));

  // --- Build Row 1: Image (field:image) ---
  // imageAlt is a collapsed field (ends with "Alt"), so no separate hint needed
  const imageCell = [];
  if (img) {
    const imageHint = document.createComment(' field:image ');
    const frag = document.createDocumentFragment();
    frag.appendChild(imageHint);
    frag.appendChild(img);
    imageCell.push(frag);
  }

  // --- Build Row 2: Text content (field:text) ---
  // Combines title, optional pretitle, description, and CTA links into single richtext cell
  const textCell = [];
  const textFrag = document.createDocumentFragment();
  const textHint = document.createComment(' field:text ');
  textFrag.appendChild(textHint);

  let hasTextContent = false;

  if (pretitle) {
    textFrag.appendChild(pretitle);
    hasTextContent = true;
  }

  if (heading) {
    textFrag.appendChild(heading);
    hasTextContent = true;
  }

  if (description) {
    textFrag.appendChild(description);
    hasTextContent = true;
  }

  if (ctaLinks.length > 0) {
    ctaLinks.forEach((link) => {
      const p = document.createElement('p');
      p.appendChild(link);
      textFrag.appendChild(p);
    });
    hasTextContent = true;
  }

  if (hasTextContent) {
    textCell.push(textFrag);
  }

  // --- Assemble cells matching block library structure ---
  // Row 1 (header): block name (handled by createBlock)
  // Row 2: image (background)
  // Row 3: text content (heading, description, CTA)
  const cells = [];
  cells.push(imageCell);
  cells.push(textCell);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
