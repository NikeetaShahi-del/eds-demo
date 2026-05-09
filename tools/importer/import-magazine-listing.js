/* eslint-disable */
/* global WebImporter */

import herofeaturedParser from "./parsers/hero-featured.js";
import cardsarticleParser from "./parsers/cards-article.js";
import wkndCleanupTransformer from './transformers/wknd-cleanup.js';
import wkndSectionsTransformer from './transformers/wknd-sections.js';

const parsers = {
  "hero-featured": herofeaturedParser,
  "cards-article": cardsarticleParser,
};

const PAGE_TEMPLATE = {
  "name": "magazine-listing",
  "urls": [
    "https://wknd.site/us/en/magazine.html",
    "https://wknd.site/ca/en/magazine.html"
  ],
  "description": "Magazine landing page listing all magazine articles with teaser cards",
  "blocks": [
    {
      "name": "hero-featured",
      "instances": [
        ".teaser.cmp-teaser--featured"
      ]
    },
    {
      "name": "cards-article",
      "instances": [
        ".image-list.list"
      ]
    }
  ]
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

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try { parser(block.element, { document, url, params }); }
        catch (e) { console.error('Parser failed:', e); }
      }
    });

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
