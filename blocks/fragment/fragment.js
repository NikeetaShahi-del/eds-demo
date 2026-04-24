/*
 * Fragment Block
 * Include content on a page as a fragment.
 * https://www.aem.live/developer/block-collection/fragment
 */

import {
  decorateMain,
  moveInstrumentation,
} from '../../scripts/scripts.js';

import {
  loadSections,
} from '../../scripts/aem.js';

/**
 * Loads a fragment.
 * @param {string} path The path to the fragment
 * @returns {Promise<HTMLElement>} The root element of the fragment
 */
export async function loadFragment(path) {
  if (path && path.startsWith('/')) {
    const resp = await fetch(`${path}.plain.html`);
    if (resp.ok) {
      const main = document.createElement('main');
      const html = await resp.text();
      // Strip server-injected <head> wrapper (scripts, styles, meta)
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
      const headEnd = html.indexOf('</head>');
      if (bodyMatch) {
        const [, bodyContent] = bodyMatch;
        main.innerHTML = bodyContent;
      } else if (headEnd > -1) {
        main.innerHTML = html.substring(headEnd + 7);
      } else {
        main.innerHTML = html;
      }

      // reset base path for media to fragment base
      const resetAttributeBase = (tag, attr) => {
        main.querySelectorAll(`${tag}[${attr}^="./media_"]`).forEach((elem) => {
          elem[attr] = new URL(elem.getAttribute(attr), new URL(path, window.location)).href;
        });
      };
      resetAttributeBase('img', 'src');
      resetAttributeBase('source', 'srcset');

      decorateMain(main);
      await loadSections(main);
      return main;
    }
  }
  return null;
}

/**
 * @param {Element} block
 */
export default async function decorate(block) {
  const link = block.querySelector('a');
  const path = link ? link.getAttribute('href') : block.textContent.trim();
  const fragment = await loadFragment(path);
  if (fragment) {
    const fragmentSection = fragment.querySelector(':scope .section');
    if (fragmentSection) {
      block.closest('.section').classList.add(...fragmentSection.classList);
      moveInstrumentation(block, block.parentElement);
      block.closest('.fragment').replaceWith(...fragment.childNodes);
    }
  }
}
