/* eslint-disable */
/* global WebImporter */

import heroFeaturedParser from './parsers/hero-featured.js';
import cardsArticleParser from './parsers/cards-article.js';
import wkndCleanupTransformer from './transformers/wknd-cleanup.js';

const parsers = {
  'hero-featured': heroFeaturedParser,
  'cards-article': cardsArticleParser,
};

const PAGE_TEMPLATE = {
  name: 'magazine-listing',
  blocks: [
    { name: 'hero-featured', instances: ['.teaser.cmp-teaser--featured'] },
    { name: 'cards-article', instances: ['.image-list.list'] },
  ],
  sections: [],
};

const transformers = [wkndCleanupTransformer];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((t) => { try { t(hookName, element, enhancedPayload); } catch (e) { console.error(e); } });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
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
      if (parser) { try { parser(block.element, { document, url, params }); } catch (e) { console.error(e); } }
    });
    executeTransformers('afterTransform', main, payload);
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
    const path = WebImporter.FileUtils.sanitizePath(new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''));
    return [{ element: main, path, report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) } }];
  },
};
