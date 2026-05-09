/* eslint-disable */
/* global WebImporter */

import carouselParser from "./parsers/carousel.js";
import tabsParser from "./parsers/tabs.js";
import wkndCleanupTransformer from './transformers/wknd-cleanup.js';
import wkndSectionsTransformer from './transformers/wknd-sections.js';

const parsers = {
  "carousel": carouselParser,
  "tabs": tabsParser,
};

const PAGE_TEMPLATE = {
  "name": "adventure-detail",
  "urls": [
    "https://wknd.site/us/en/adventures/bali-surf-camp.html",
    "https://wknd.site/us/en/adventures/beervana-portland.html",
    "https://wknd.site/us/en/adventures/climbing-new-zealand.html",
    "https://wknd.site/us/en/adventures/colorado-rock-climbing.html",
    "https://wknd.site/us/en/adventures/cycling-southern-utah.html",
    "https://wknd.site/us/en/adventures/cycling-tuscany.html",
    "https://wknd.site/us/en/adventures/downhill-skiing-wyoming.html",
    "https://wknd.site/us/en/adventures/gastronomic-marais-tour.html",
    "https://wknd.site/us/en/adventures/napa-wine-tasting.html",
    "https://wknd.site/us/en/adventures/riverside-camping-australia.html",
    "https://wknd.site/us/en/adventures/ski-touring-mont-blanc.html",
    "https://wknd.site/us/en/adventures/surf-camp-costa-rica.html",
    "https://wknd.site/us/en/adventures/tahoe-skiing.html",
    "https://wknd.site/us/en/adventures/west-coast-cycling.html",
    "https://wknd.site/us/en/adventures/whistler-mountain-biking.html",
    "https://wknd.site/us/en/adventures/yosemite-backpacking.html",
    "https://wknd.site/ca/en/adventures/bali-surf-camp.html",
    "https://wknd.site/ca/en/adventures/beervana-portland.html",
    "https://wknd.site/ca/en/adventures/climbing-new-zealand.html",
    "https://wknd.site/ca/en/adventures/colorado-rock-climbing.html",
    "https://wknd.site/ca/en/adventures/cycling-southern-utah.html",
    "https://wknd.site/ca/en/adventures/cycling-tuscany.html",
    "https://wknd.site/ca/en/adventures/downhill-skiing-wyoming.html",
    "https://wknd.site/ca/en/adventures/gastronomic-marais-tour.html",
    "https://wknd.site/ca/en/adventures/napa-wine-tasting.html",
    "https://wknd.site/ca/en/adventures/riverside-camping-australia.html",
    "https://wknd.site/ca/en/adventures/ski-touring-mont-blanc.html",
    "https://wknd.site/ca/en/adventures/surf-camp-costa-rica.html",
    "https://wknd.site/ca/en/adventures/tahoe-skiing.html",
    "https://wknd.site/ca/en/adventures/west-coast-cycling.html",
    "https://wknd.site/ca/en/adventures/whistler-mountain-biking.html",
    "https://wknd.site/ca/en/adventures/yosemite-backpacking.html"
  ],
  "description": "Adventure detail page with hero image, itinerary details, activity info, and pricing",
  "blocks": [
    {
      "name": "carousel",
      "instances": [
        ".carousel.cmp-carousel--mini"
      ]
    },
    {
      "name": "tabs",
      "instances": [
        ".tabs.panelcontainer"
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
