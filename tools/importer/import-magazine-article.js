/* eslint-disable */
/* global WebImporter */

import wkndCleanupTransformer from './transformers/wknd-cleanup.js';

const parsers = {};

const PAGE_TEMPLATE = {
  name: 'magazine-article',
  blocks: [],
  sections: [],
};

const transformers = [wkndCleanupTransformer];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((t) => { try { t(hookName, element, enhancedPayload); } catch (e) { console.error(e); } });
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;
    executeTransformers('beforeTransform', main, payload);

    // Magazine articles are primarily default content (headings, paragraphs, images)
    // Extract the article content fragment and clean it up
    const contentFragment = main.querySelector('.cmp-contentfragment__elements');
    if (contentFragment) {
      // Get all content elements
      const elements = contentFragment.querySelectorAll('h1, h2, h3, h4, h5, h6, p, img, picture, ul, ol, blockquote');
      const articleContent = document.createDocumentFragment();
      elements.forEach((el) => {
        articleContent.appendChild(el.cloneNode(true));
      });

      // Get the hero image
      const heroImg = main.querySelector('.image.cmp-image--article-hero img, main > .container > .image img');
      if (heroImg) {
        const picture = document.createElement('picture');
        const newImg = document.createElement('img');
        newImg.src = heroImg.src;
        newImg.alt = heroImg.alt || '';
        picture.appendChild(newImg);
        main.innerHTML = '';
        main.appendChild(picture);
      } else {
        main.innerHTML = '';
      }

      main.appendChild(articleContent);
    }

    // Handle byline/author info
    const byline = main.querySelector('.cmp-byline');
    if (byline) {
      const bylineName = byline.querySelector('.cmp-byline__name');
      const bylineOccupations = byline.querySelector('.cmp-byline__occupations');
      const bylineImg = byline.querySelector('.cmp-byline__image img');

      if (bylineName || bylineOccupations) {
        const hr = document.createElement('hr');
        main.appendChild(hr);
        if (bylineImg) {
          const picture = document.createElement('picture');
          const newImg = document.createElement('img');
          newImg.src = bylineImg.src;
          newImg.alt = bylineName ? bylineName.textContent.trim() : '';
          picture.appendChild(newImg);
          main.appendChild(picture);
        }
        if (bylineName) {
          const p = document.createElement('p');
          const strong = document.createElement('strong');
          strong.textContent = bylineName.textContent.trim();
          p.appendChild(strong);
          main.appendChild(p);
        }
        if (bylineOccupations) {
          const p = document.createElement('p');
          p.textContent = bylineOccupations.textContent.trim();
          main.appendChild(p);
        }
      }
    }

    executeTransformers('afterTransform', main, payload);
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
    const path = WebImporter.FileUtils.sanitizePath(new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''));
    return [{ element: main, path, report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: [] } }];
  },
};
