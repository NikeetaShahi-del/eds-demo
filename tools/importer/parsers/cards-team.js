/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-team variant.
 * Base block: cards
 * Source selector: .experiencefragment.cmp-experience-fragment--contributor
 * UE Model: container block with child "card" items (fields: image, text)
 * Generated: 2026-05-13
 *
 * Source HTML structure (per contributor section):
 *   section.experiencefragment.cmp-experience-fragment--contributor
 *     .cmp-experiencefragment
 *       .xf-content-height
 *         .cmp-container
 *           .container.responsivegrid.cmp-layout-container--fixed
 *             .cmp-container
 *               .image > .cmp-image > img.cmp-image__image         (portrait photo)
 *               .title > .cmp-title > h3.cmp-title__text           (contributor name)
 *               .title > .cmp-title > h5.cmp-title__text           (role/title)
 *               .buildingblock.cmp-buildingblock--btn-list          (social media buttons)
 *                 .button .cmp-button > .cmp-button__icon + .cmp-button__text
 *
 * Target table (following cards UE model):
 *   | cards-team                                     |
 *   | image (portrait)  | name + role + social links |
 *   | image (portrait)  | name + role + social links |
 *   ...
 *
 * Each row = one contributor card with 2 columns:
 *   Column 1: image (field: image) - contributor portrait photo
 *   Column 2: text (field: text) - name (h3), role (h5), social media link buttons
 */
export default function parse(element, { document }) {
  // The element is a single contributor section matching
  // .experiencefragment.cmp-experience-fragment--contributor
  // Each call handles one contributor card.

  // --- Column 1: Image with field hint ---
  const img = element.querySelector('img.cmp-image__image, .cmp-image img, img');
  const imageCell = document.createDocumentFragment();
  imageCell.appendChild(document.createComment(' field:image '));
  if (img) {
    const picture = document.createElement('picture');
    const newImg = document.createElement('img');
    newImg.src = img.src || img.getAttribute('src') || '';
    newImg.alt = img.alt || img.getAttribute('alt') || '';
    picture.appendChild(newImg);
    imageCell.appendChild(picture);
  }

  // --- Column 2: Text content (name + role + social links) with field hint ---
  const textCell = document.createDocumentFragment();
  textCell.appendChild(document.createComment(' field:text '));

  // Extract contributor name (h3)
  const nameEl = element.querySelector('h3.cmp-title__text, h3');
  if (nameEl) {
    const h3 = document.createElement('h3');
    h3.textContent = nameEl.textContent.trim();
    textCell.appendChild(h3);
  }

  // Extract contributor role/title (h5)
  const roleEl = element.querySelector('h5.cmp-title__text, h5');
  if (roleEl) {
    const h5 = document.createElement('h5');
    h5.textContent = roleEl.textContent.trim();
    textCell.appendChild(h5);
  }

  // Extract social media buttons — each in its own <p> to prevent markdown link merging
  // when multiple buttons share the same href (e.g. #jacob-wester for all 3 socials)
  const socialButtons = element.querySelectorAll('.cmp-buildingblock--btn-list .cmp-button, .buildingblock a.cmp-button');
  socialButtons.forEach((btn) => {
    const href = btn.href || btn.getAttribute('href') || '#';
    const textSpan = btn.querySelector('.cmp-button__text');
    const label = textSpan ? textSpan.textContent.trim() : btn.textContent.trim();

    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = href;
    a.textContent = label;
    p.appendChild(a);
    textCell.appendChild(p);
  });

  const cells = [[imageCell, textCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-team', cells });
  element.replaceWith(block);
}
