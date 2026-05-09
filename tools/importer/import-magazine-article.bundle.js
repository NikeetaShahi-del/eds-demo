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

  // tools/importer/import-magazine-article.js
  var import_magazine_article_exports = {};
  __export(import_magazine_article_exports, {
    default: () => import_magazine_article_default
  });

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

  // tools/importer/import-magazine-article.js
  var PAGE_TEMPLATE = {
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
  var import_magazine_article_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
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
  return __toCommonJS(import_magazine_article_exports);
})();
