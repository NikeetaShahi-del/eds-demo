/* eslint-disable */
/* global WebImporter */

import wkndCleanupTransformer from './transformers/wknd-cleanup.js';
import wkndSectionsTransformer from './transformers/wknd-sections.js';


const PAGE_TEMPLATE = {
  "name": "placeholder-landing",
  "urls": [
    "https://wknd.site/us/es.html",
    "https://wknd.site/ca/fr.html",
    "https://wknd.site/ch/de.html",
    "https://wknd.site/ch/fr.html",
    "https://wknd.site/ch/it.html",
    "https://wknd.site/de/de.html",
    "https://wknd.site/fr/fr.html",
    "https://wknd.site/es/es.html",
    "https://wknd.site/it/it.html"
  ],
  "description": "Coming Soon placeholder landing page for non-English locale variants with hero image and language selector",
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
