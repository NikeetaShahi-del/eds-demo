/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroAdventureParser from './parsers/hero-adventure.js';
import tabsAdventureParser from './parsers/tabs-adventure.js';

// TRANSFORMER IMPORTS
import wkndCleanupTransformer from './transformers/wknd-cleanup.js';
import wkndSectionsTransformer from './transformers/wknd-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-adventure': heroAdventureParser,
  'tabs-adventure': tabsAdventureParser,
};

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'adventures-listing',
  description: 'Adventures landing page with hero teaser and tabbed adventure listing',
  urls: [
    'https://wknd.site/us/en/adventures.html',
    'https://wknd.site/ca/en/adventures.html',
  ],
  blocks: [
    {
      name: 'hero-adventure',
      instances: ['.teaser:not(.cmp-teaser--featured):not(.cmp-teaser--hero):not(.cmp-teaser--list)'],
    },
    {
      name: 'tabs-adventure',
      instances: ['.tabs.panelcontainer'],
    },
  ],
  sections: [
    {
      id: 'section-1',
      name: 'Page Title',
      selector: '.title h1',
      style: null,
      blocks: [],
      defaultContent: ['.title h1'],
    },
    {
      id: 'section-2',
      name: 'Hero Adventure Teaser',
      selector: '.teaser:not(.cmp-teaser--featured):not(.cmp-teaser--hero):not(.cmp-teaser--list)',
      style: null,
      blocks: ['hero-adventure'],
      defaultContent: [],
    },
    {
      id: 'section-3',
      name: 'Current Adventures Tabs',
      selector: '.tabs.panelcontainer',
      style: null,
      blocks: ['tabs-adventure'],
      defaultContent: ['.title.cmp-title--underline h2', '.separator hr'],
    },
  ],
};

// TRANSFORMER REGISTRY
const transformers = [
  wkndCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [wkndSectionsTransformer] : []),
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
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
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
