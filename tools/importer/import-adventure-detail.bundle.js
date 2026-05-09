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

  // tools/importer/import-adventure-detail.js
  var import_adventure_detail_exports = {};
  __export(import_adventure_detail_exports, {
    default: () => import_adventure_detail_default
  });

  // tools/importer/parsers/carousel.js
  function parse(element, { document }) {
    const slides = element.querySelectorAll(".cmp-carousel__item");
    const cells = [];
    slides.forEach((slide) => {
      const image = slide.querySelector(".cmp-teaser__image img, .cmp-image__image, img");
      const title = slide.querySelector('.cmp-teaser__title, h2, h1, h3, [class*="title"]');
      const description = slide.querySelector('.cmp-teaser__description, [class*="description"]');
      const ctaLinks = Array.from(slide.querySelectorAll(".cmp-teaser__action-link, .cmp-teaser__action-container a"));
      const mediaCell = document.createDocumentFragment();
      mediaCell.appendChild(document.createComment(" field:media_image "));
      if (image) {
        mediaCell.appendChild(image);
      }
      const contentCell = document.createDocumentFragment();
      contentCell.appendChild(document.createComment(" field:content_text "));
      if (title) {
        contentCell.appendChild(title);
      }
      if (description) {
        contentCell.appendChild(description);
      }
      ctaLinks.forEach((link) => {
        const p = document.createElement("p");
        p.appendChild(link);
        contentCell.appendChild(p);
      });
      cells.push([mediaCell, contentCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel", cells });
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

  // tools/importer/import-adventure-detail.js
  var parsers = {
    "carousel": parse,
    "tabs": parse2
  };
  var PAGE_TEMPLATE = {
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
  var import_adventure_detail_default = {
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
  return __toCommonJS(import_adventure_detail_exports);
})();
