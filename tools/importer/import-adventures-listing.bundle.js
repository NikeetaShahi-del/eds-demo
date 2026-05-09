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

  // tools/importer/parsers/hero.js
  function parse(element, { document }) {
    const img = element.querySelector(".cmp-teaser__image img.cmp-image__image, .cmp-teaser__image img");
    const pretitle = element.querySelector("p.cmp-teaser__pretitle");
    const heading = element.querySelector("h2.cmp-teaser__title, h1.cmp-teaser__title, h3.cmp-teaser__title");
    const description = element.querySelector("div.cmp-teaser__description, p.cmp-teaser__description");
    const ctaLinks = Array.from(element.querySelectorAll(".cmp-teaser__action-container a.cmp-teaser__action-link"));
    const imageCell = [];
    if (img) {
      const imageHint = document.createComment(" field:image ");
      const frag = document.createDocumentFragment();
      frag.appendChild(imageHint);
      frag.appendChild(img);
      imageCell.push(frag);
    }
    const textCell = [];
    const textFrag = document.createDocumentFragment();
    const textHint = document.createComment(" field:text ");
    textFrag.appendChild(textHint);
    let hasTextContent = false;
    if (pretitle) {
      textFrag.appendChild(pretitle);
      hasTextContent = true;
    }
    if (heading) {
      textFrag.appendChild(heading);
      hasTextContent = true;
    }
    if (description) {
      textFrag.appendChild(description);
      hasTextContent = true;
    }
    if (ctaLinks.length > 0) {
      ctaLinks.forEach((link) => {
        const p = document.createElement("p");
        p.appendChild(link);
        textFrag.appendChild(p);
      });
      hasTextContent = true;
    }
    if (hasTextContent) {
      textCell.push(textFrag);
    }
    const cells = [];
    cells.push(imageCell);
    cells.push(textCell);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs.js
  function parse2(element, { document }) {
    const tabsEl = element.querySelector(".cmp-tabs") || element;
    const tabs = tabsEl.querySelectorAll(".cmp-tabs__tab");
    const panels = tabsEl.querySelectorAll(".cmp-tabs__tabpanel");
    const cells = [];
    tabs.forEach((tab, i) => {
      const label = tab.textContent.trim();
      const titleCell = document.createDocumentFragment();
      titleCell.appendChild(document.createComment(" field:title "));
      const titleP = document.createElement("p");
      titleP.textContent = label;
      titleCell.appendChild(titleP);
      const contentCell = document.createDocumentFragment();
      if (panels[i]) {
        contentCell.appendChild(document.createComment(" field:content_heading "));
        const heading = panels[i].querySelector("h3, h4, h5, h6");
        if (heading) {
          const h = document.createElement(heading.tagName.toLowerCase());
          h.textContent = heading.textContent.trim();
          contentCell.appendChild(h);
        } else {
          const h3 = document.createElement("h3");
          h3.textContent = label;
          contentCell.appendChild(h3);
        }
        const firstImg = panels[i].querySelector("img");
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
        const textElements = panels[i].querySelectorAll("p, ul, ol");
        textElements.forEach((el) => {
          if (el.tagName === "P") {
            const imgs = el.querySelectorAll("img");
            if (imgs.length > 0 && el.textContent.trim() === "") return;
          }
          const clone = el.cloneNode(true);
          clone.querySelectorAll("img, picture").forEach((img) => img.remove());
          if (clone.textContent.trim()) {
            contentCell.appendChild(clone);
          }
        });
      }
      cells.push([titleCell, contentCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-article.js
  function parse3(element, { document }) {
    const items = element.querySelectorAll(".cmp-image-list__item");
    const cells = [];
    items.forEach((item) => {
      const img = item.querySelector(".cmp-image-list__item-image img, .cmp-image__image");
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
      const titleEl = item.querySelector(".cmp-image-list__item-title");
      const titleLink = item.querySelector(".cmp-image-list__item-title-link");
      if (titleEl) {
        const p = document.createElement("p");
        if (titleLink) {
          const a = document.createElement("a");
          a.href = titleLink.href;
          a.textContent = titleEl.textContent.trim();
          const strong = document.createElement("strong");
          strong.appendChild(a);
          p.appendChild(strong);
        } else {
          const strong = document.createElement("strong");
          strong.textContent = titleEl.textContent.trim();
          p.appendChild(strong);
        }
        textCell.appendChild(p);
      }
      const desc = item.querySelector(".cmp-image-list__item-description");
      if (desc) {
        const p = document.createElement("p");
        p.textContent = desc.textContent.trim();
        textCell.appendChild(p);
      }
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-article", cells });
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
    "hero": parse,
    "tabs": parse2,
    "cards-article": parse3
  };
  var PAGE_TEMPLATE = {
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
        console.error("Transformer failed:", e);
      }
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
            console.error("Parser failed:", e);
          }
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
      return [{ element: main, path, report: { title: document.title, template: PAGE_TEMPLATE.name } }];
    }
  };
  return __toCommonJS(import_adventures_listing_exports);
})();
