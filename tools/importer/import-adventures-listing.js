/* eslint-disable */
/* global WebImporter */

import heroParser from "./parsers/hero.js";
import tabsParser from "./parsers/tabs.js";
import cardsarticleParser from "./parsers/cards-article.js";
import wkndCleanupTransformer from './transformers/wknd-cleanup.js';
import wkndSectionsTransformer from './transformers/wknd-sections.js';

const parsers = {
  "hero": heroParser,
  "tabs": tabsParser,
  "cards-article": cardsarticleParser,
};

const PAGE_TEMPLATE = {
  "name": "adventures-listing",
  "urls": [
    "https://wknd.site/us/en/adventures.html",
    "https://wknd.site/ca/en/adventures.html"
  ],
  "description": "Adventures landing page with filterable grid of adventure cards",
  "blocks": [
    {
      "name": "hero",
      "instances": [
        ".teaser:not(.cmp-teaser--featured):not(.cmp-teaser--hero):not(.cmp-teaser--list)"
      ]
    },
    {
      "name": "tabs",
      "instances": [
        ".cmp-tabs"
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
