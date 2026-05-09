/* eslint-disable */
/* global WebImporter */

import wkndCleanupTransformer from './transformers/wknd-cleanup.js';
import wkndSectionsTransformer from './transformers/wknd-sections.js';


const PAGE_TEMPLATE = {
  "name": "magazine-article",
  "urls": [
    "https://wknd.site/us/en/magazine/san-diego-surf.html",
    "https://wknd.site/us/en/magazine/western-australia.html",
    "https://wknd.site/us/en/magazine/guide-la-skateparks.html",
    "https://wknd.site/us/en/magazine/ski-touring.html",
    "https://wknd.site/us/en/magazine/arctic-surfing.html",
    "https://wknd.site/ca/en/magazine/san-diego-surf.html",
    "https://wknd.site/ca/en/magazine/western-australia.html",
    "https://wknd.site/ca/en/magazine/guide-la-skateparks.html",
    "https://wknd.site/ca/en/magazine/ski-touring.html",
    "https://wknd.site/ca/en/magazine/arctic-surfing.html"
  ],
  "description": "Magazine article detail page with hero image, article body content, and related articles",
  "blocks": []
};

const transformers = [
  wkndCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [wkndSectionsTransformer] : []),
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try { transformerFn.call(null, hookName, element, enhancedPayload); }
    catch (e) { console.error('Transformer failed:', e); }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '')
    );

    return [{ element: main, path, report: { title: document.title, template: PAGE_TEMPLATE.name } }];
  },
};
