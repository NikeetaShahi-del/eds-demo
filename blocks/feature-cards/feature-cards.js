/*
 * Feature Cards Block
 *
 * Purpose: Display a grid of feature cards with image, eyebrow, title, description, and optional CTA
 * Layout: Responsive 1/2/4 columns based on viewport width
 * Standards: Vanilla JS, CSS custom properties, WCAG 2.1 AA, Lighthouse ≥95
 *
 * Model fields (from component-models.json):
 * - image (reference): Card image
 * - eyebrow (text): Label/eyebrow above title
 * - title (text): Card title
 * - description (richtext): Card description
 * - link (aem-content): Optional CTA link
 *
 * Reference: docs/context.md, INSTRUCTIONS.md
 */

export default async function decorate(block) {
  // Iterate over rows (each row = one card)
  const cards = Array.from(block.children);

  block.innerHTML = '';
  block.classList.add('feature-cards-container');

  const cardList = document.createElement('ul');
  cardList.className = 'feature-cards-list';
  cardList.setAttribute('role', 'list');

  cards.forEach((row, index) => {
    const divs = Array.from(row.children);

    // Extract fields in model order:
    // 0: image
    // 1: eyebrow
    // 2: title
    // 3: description
    // 4: link (CTA)

    const imageDiv = divs[0];
    const eyebrowDiv = divs[1];
    const titleDiv = divs[2];
    const descriptionDiv = divs[3];
    const linkDiv = divs[4];

    // Build card structure
    const cardItem = document.createElement('li');
    cardItem.className = 'feature-cards-item';
    cardItem.setAttribute('role', 'listitem');

    const card = document.createElement('article');
    card.className = 'feature-card';

    // Image
    const imageSection = document.createElement('div');
    imageSection.className = 'feature-card-image';
    if (imageDiv) {
      const picture = imageDiv.querySelector('picture');
      if (picture) {
        imageSection.appendChild(picture.cloneNode(true));
      }
    }
    card.appendChild(imageSection);

    // Content
    const contentSection = document.createElement('div');
    contentSection.className = 'feature-card-content';

    // Eyebrow
    if (eyebrowDiv && eyebrowDiv.textContent.trim()) {
      const eyebrow = document.createElement('span');
      eyebrow.className = 'feature-card-eyebrow';
      eyebrow.textContent = eyebrowDiv.textContent.trim();
      contentSection.appendChild(eyebrow);
    }

    // Title (H3 for accessibility)
    if (titleDiv && titleDiv.textContent.trim()) {
      const title = document.createElement('h3');
      title.className = 'feature-card-title';
      title.textContent = titleDiv.textContent.trim();
      contentSection.appendChild(title);
    }

    // Description
    if (descriptionDiv && descriptionDiv.textContent.trim()) {
      const description = document.createElement('div');
      description.className = 'feature-card-description';
      description.innerHTML = descriptionDiv.innerHTML;
      contentSection.appendChild(description);
    }

    // CTA Link
    if (linkDiv && linkDiv.querySelector('a')) {
      const link = linkDiv.querySelector('a').cloneNode(true);
      link.className = 'feature-card-cta';
      contentSection.appendChild(link);
    }

    card.appendChild(contentSection);
    cardItem.appendChild(card);
    cardList.appendChild(cardItem);
  });

  block.appendChild(cardList);
}

