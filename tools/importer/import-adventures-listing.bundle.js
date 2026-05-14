/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-adventures-listing.js
  var import_adventures_listing_exports = {};
  __export(import_adventures_listing_exports, {
    default: () => import_adventures_listing_default
  });

  // tools/importer/parsers/hero-adventure.js
  function parse(element, { document }) {
    const img = element.querySelector(".cmp-teaser__image img, .cmp-image__image");
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(" field:image "));
    if (img) {
      const picture = document.createElement("picture");
      const newImg = document.createElement("img");
      newImg.src = img.src;
      newImg.alt = img.alt || "";
      picture.appendChild(newImg);
      imageCell.appendChild(picture);
    }
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(" field:text "));
    const heading = element.querySelector(".cmp-teaser__title");
    if (heading) {
      const h2 = document.createElement("h2");
      h2.textContent = heading.textContent.trim();
      textCell.appendChild(h2);
    }
    const desc = element.querySelector(".cmp-teaser__description");
    if (desc) {
      const p = document.createElement("p");
      p.textContent = desc.textContent.trim();
      textCell.appendChild(p);
    }
    const cta = element.querySelector(".cmp-teaser__action-link");
    if (cta) {
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.href = cta.href;
      a.textContent = cta.textContent.trim();
      p.appendChild(a);
      textCell.appendChild(p);
    }
    const cells = [
      [imageCell],
      [textCell]
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-adventure", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-adventure.js
  function parse2(element, { document }) {
    const tabsEl = element.querySelector(".cmp-tabs") || element;
    const tabs = tabsEl.querySelectorAll(".cmp-tabs__tablist > .cmp-tabs__tab");
    const tabButtons = tabs.length > 0 ? tabs : tabsEl.querySelectorAll(".cmp-tabs__tab");
    const panels = tabsEl.querySelectorAll(":scope > .cmp-tabs__tabpanel");
    const tabPanels = panels.length > 0 ? panels : tabsEl.querySelectorAll(".cmp-tabs__tabpanel");
    const cells = [];
    tabButtons.forEach((tab, i) => {
      const label = tab.textContent.trim();
      const titleCell = document.createDocumentFragment();
      titleCell.appendChild(document.createComment(" field:title "));
      const titleP = document.createElement("p");
      titleP.textContent = label;
      titleCell.appendChild(titleP);
      const contentCell = document.createDocumentFragment();
      contentCell.appendChild(document.createComment(" field:content_heading "));
      const h3 = document.createElement("h3");
      h3.textContent = label;
      contentCell.appendChild(h3);
      if (tabPanels[i]) {
        const panel = tabPanels[i];
        const imageList = panel.querySelector(".cmp-image-list");
        if (imageList) {
          const items = imageList.querySelectorAll(".cmp-image-list__item");
          if (items.length > 0) {
            const firstImg = items[0].querySelector("img");
            if (firstImg) {
              contentCell.appendChild(document.createComment(" field:content_image "));
              const picture = document.createElement("picture");
              const newImg = document.createElement("img");
              newImg.src = firstImg.src;
              newImg.alt = firstImg.alt || "";
              picture.appendChild(newImg);
              contentCell.appendChild(picture);
            }
            contentCell.appendChild(document.createComment(" field:content_richtext "));
            items.forEach((item) => {
              const titleLink = item.querySelector(".cmp-image-list__item-title-link");
              const titleEl = item.querySelector(".cmp-image-list__item-title");
              const desc = item.querySelector(".cmp-image-list__item-description");
              if (titleEl) {
                const p = document.createElement("p");
                if (titleLink) {
                  const a = document.createElement("a");
                  a.href = titleLink.href || titleLink.getAttribute("href") || "#";
                  a.textContent = titleEl.textContent.trim();
                  const strong = document.createElement("strong");
                  strong.appendChild(a);
                  p.appendChild(strong);
                } else {
                  const strong = document.createElement("strong");
                  strong.textContent = titleEl.textContent.trim();
                  p.appendChild(strong);
                }
                contentCell.appendChild(p);
              }
              if (desc) {
                const descP = document.createElement("p");
                descP.textContent = desc.textContent.trim();
                contentCell.appendChild(descP);
              }
            });
          }
        }
      }
      cells.push([titleCell, contentCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs-adventure", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/wknd-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "iframe#destination_publishing_iframe_wkndsite_0",
        'iframe[src*="demdex.net"]'
      ]);
      const orphanMeta = element.querySelectorAll(".cmp-image > meta");
      orphanMeta.forEach((el) => el.remove());
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header.experiencefragment.cmp-experiencefragment--header"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "footer.experiencefragment.cmp-experiencefragment--footer"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "#toggleNav",
        "#mobileNav"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "iframe",
        "link",
        "noscript"
      ]);
      element.querySelectorAll("[data-cmp-data-layer-enabled]").forEach((el) => {
        el.removeAttribute("data-cmp-data-layer-enabled");
      });
      element.querySelectorAll("[data-cmp-data-layer-name]").forEach((el) => {
        el.removeAttribute("data-cmp-data-layer-name");
      });
      element.querySelectorAll("[data-cmp-link-accessibility-enabled]").forEach((el) => {
        el.removeAttribute("data-cmp-link-accessibility-enabled");
      });
      element.querySelectorAll("[data-cmp-link-accessibility-text]").forEach((el) => {
        el.removeAttribute("data-cmp-link-accessibility-text");
      });
    }
  }

  // tools/importer/transformers/wknd-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.afterTransform) {
      const { document } = element.ownerDocument ? { document: element.ownerDocument } : { document: element.getRootNode() };
      const sections = payload && payload.template && payload.template.sections;
      if (!sections || sections.length < 2) {
        return;
      }
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const sectionEl = element.querySelector(section.selector);
        if (!sectionEl) {
          continue;
        }
        if (section.style) {
          const sectionMetadata = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.after(sectionMetadata);
        }
        if (i > 0) {
          const hr = document.createElement("hr");
          sectionEl.before(hr);
        }
      }
    }
  }

  // tools/importer/import-adventures-listing.js
  var parsers = {
    "hero-adventure": parse,
    "tabs-adventure": parse2
  };
  var PAGE_TEMPLATE = {
    name: "adventures-listing",
    description: "Adventures landing page with hero teaser and tabbed adventure listing",
    urls: [
      "https://wknd.site/us/en/adventures.html",
      "https://wknd.site/ca/en/adventures.html"
    ],
    blocks: [
      {
        name: "hero-adventure",
        instances: [".teaser:not(.cmp-teaser--featured):not(.cmp-teaser--hero):not(.cmp-teaser--list)"]
      },
      {
        name: "tabs-adventure",
        instances: [".tabs.panelcontainer"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Page Title",
        selector: ".title h1",
        style: null,
        blocks: [],
        defaultContent: [".title h1"]
      },
      {
        id: "section-2",
        name: "Hero Adventure Teaser",
        selector: ".teaser:not(.cmp-teaser--featured):not(.cmp-teaser--hero):not(.cmp-teaser--list)",
        style: null,
        blocks: ["hero-adventure"],
        defaultContent: []
      },
      {
        id: "section-3",
        name: "Current Adventures Tabs",
        selector: ".tabs.panelcontainer",
        style: null,
        blocks: ["tabs-adventure"],
        defaultContent: [".title.cmp-title--underline h2", ".separator hr"]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_adventures_listing_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_adventures_listing_exports);
})();
