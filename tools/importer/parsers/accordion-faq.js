/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-faq variant.
 * Base block: accordion
 * Source: https://wknd.site/us/en/faqs.html
 * DOM selector: .accordion.panelcontainer
 * UE Model fields: summary (text/string), text (richtext/string)
 * Generated: 2026-05-13
 */
export default function parse(element, { document }) {
  // Each .cmp-accordion__item becomes one row with two columns: [summary, text]
  const items = element.querySelectorAll('.cmp-accordion__item');
  const cells = [];

  items.forEach((item) => {
    // Extract the question title from the accordion button span
    const titleSpan = item.querySelector('.cmp-accordion__title');

    // Build summary cell with field hint
    const summaryCell = document.createDocumentFragment();
    summaryCell.appendChild(document.createComment(' field:summary '));
    if (titleSpan) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = titleSpan.textContent.trim();
      p.appendChild(strong);
      summaryCell.appendChild(p);
    }

    // Extract the answer content from the accordion panel
    const panel = item.querySelector('.cmp-accordion__panel');

    // Build text cell with field hint
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));
    if (panel) {
      // Select rich text content elements: paragraphs, headings, lists
      const contentElements = panel.querySelectorAll('.cmp-text p, .cmp-text h1, .cmp-text h2, .cmp-text h3, .cmp-text h4, .cmp-text h5, .cmp-text h6, .cmp-text ul, .cmp-text ol');
      contentElements.forEach((el) => {
        // Skip empty headings (source has some blank h3 elements)
        if (el.textContent.trim().length > 0) {
          textCell.appendChild(el.cloneNode(true));
        }
      });
      // Fallback: if no structured content found, use panel text directly
      if (textCell.childNodes.length === 1) {
        const fallbackText = panel.textContent.trim();
        if (fallbackText) {
          const p = document.createElement('p');
          p.textContent = fallbackText;
          textCell.appendChild(p);
        }
      }
    }

    cells.push([summaryCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
