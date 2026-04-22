/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion block. Source: https://wknd.site/us/en/faqs.html
 * DOM selector: .accordion.panelcontainer
 */
export default function parse(element, { document }) {
  const items = element.querySelectorAll('.cmp-accordion__item');
  const cells = [];

  items.forEach((item) => {
    const header = item.querySelector('.cmp-accordion__title');
    const panel = item.querySelector('.cmp-accordion__panel');

    const headerCell = document.createDocumentFragment();
    if (header) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = header.textContent.trim();
      p.appendChild(strong);
      headerCell.appendChild(p);
    }

    const bodyCell = document.createDocumentFragment();
    if (panel) {
      const content = panel.querySelectorAll('p, h1, h2, h3, h4, h5, h6, ul, ol');
      content.forEach((el) => {
        bodyCell.appendChild(el.cloneNode(true));
      });
      if (bodyCell.childNodes.length === 0) {
        const p = document.createElement('p');
        p.textContent = panel.textContent.trim();
        bodyCell.appendChild(p);
      }
    }

    cells.push([headerCell, bodyCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion', cells });
  element.replaceWith(block);
}
