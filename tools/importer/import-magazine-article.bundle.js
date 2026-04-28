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
  var H = { before: "beforeTransform", after: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === H.before) {
      WebImporter.DOMUtils.remove(element, [
        'iframe[title="Adobe ID Syncing iFrame"]',
        'img[src*="demdex.net"]',
        'img[src*="2o7.net"]'
      ]);
    }
    if (hookName === H.after) {
      element.querySelectorAll("blockquote").forEach((bq) => {
        const wrapper = document.createElement("div");
        const children = [...bq.childNodes];
        children.forEach((child) => {
          if (child.nodeType === 1 && child.tagName === "P") {
            const em = document.createElement("em");
            em.textContent = child.textContent;
            const p = document.createElement("p");
            p.appendChild(em);
            wrapper.appendChild(p);
          } else if (child.nodeType === 3 && child.textContent.trim()) {
            const em = document.createElement("em");
            em.textContent = child.textContent.trim();
            const p = document.createElement("p");
            p.appendChild(em);
            wrapper.appendChild(p);
          } else {
            wrapper.appendChild(child.cloneNode(true));
          }
        });
        bq.replaceWith(wrapper);
      });
      element.querySelectorAll(".breadcrumb, .cmp-breadcrumb").forEach((bc) => bc.remove());
      const firstOl = element.querySelector("main ol:first-child, .cmp-container > .aem-Grid > ol:first-child");
      if (firstOl) {
        const items = firstOl.querySelectorAll("li");
        const looksLikeBreadcrumb = items.length <= 4 && [...items].some((li) => li.querySelector("a"));
        if (looksLikeBreadcrumb) firstOl.remove();
      }
      WebImporter.DOMUtils.remove(element, [
        "header.experiencefragment",
        "footer.experiencefragment",
        "#toggleNav",
        "#mobileNav",
        ".cmp-navigation--mobile",
        "noscript",
        "link"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("data-cmp-data-layer-enabled");
        el.removeAttribute("data-cmp-data-layer-name");
        el.removeAttribute("data-cmp-link-accessibility-enabled");
        el.removeAttribute("data-cmp-link-accessibility-text");
      });
    }
  }

  // tools/importer/import-magazine-article.js
  var PAGE_TEMPLATE = {
    name: "magazine-article",
    blocks: [],
    sections: []
  };
  var transformers = [transform];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((t) => {
      try {
        t(hookName, element, enhancedPayload);
      } catch (e) {
        console.error(e);
      }
    });
  }
  var import_magazine_article_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const contentFragment = main.querySelector(".cmp-contentfragment__elements");
      if (contentFragment) {
        const elements = contentFragment.querySelectorAll("h1, h2, h3, h4, h5, h6, p, img, picture, ul, ol, blockquote");
        const articleContent = document2.createDocumentFragment();
        elements.forEach((el) => {
          articleContent.appendChild(el.cloneNode(true));
        });
        const heroImg = main.querySelector(".image.cmp-image--article-hero img, main > .container > .image img");
        if (heroImg) {
          const picture = document2.createElement("picture");
          const newImg = document2.createElement("img");
          newImg.src = heroImg.src;
          newImg.alt = heroImg.alt || "";
          picture.appendChild(newImg);
          main.innerHTML = "";
          main.appendChild(picture);
        } else {
          main.innerHTML = "";
        }
        main.appendChild(articleContent);
      }
      const byline = main.querySelector(".cmp-byline");
      if (byline) {
        const bylineName = byline.querySelector(".cmp-byline__name");
        const bylineOccupations = byline.querySelector(".cmp-byline__occupations");
        const bylineImg = byline.querySelector(".cmp-byline__image img");
        if (bylineName || bylineOccupations) {
          const hr2 = document2.createElement("hr");
          main.appendChild(hr2);
          if (bylineImg) {
            const picture = document2.createElement("picture");
            const newImg = document2.createElement("img");
            newImg.src = bylineImg.src;
            newImg.alt = bylineName ? bylineName.textContent.trim() : "";
            picture.appendChild(newImg);
            main.appendChild(picture);
          }
          if (bylineName) {
            const p = document2.createElement("p");
            const strong = document2.createElement("strong");
            strong.textContent = bylineName.textContent.trim();
            p.appendChild(strong);
            main.appendChild(p);
          }
          if (bylineOccupations) {
            const p = document2.createElement("p");
            p.textContent = bylineOccupations.textContent.trim();
            main.appendChild(p);
          }
        }
      }
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, ""));
      return [{ element: main, path, report: { title: document2.title, template: PAGE_TEMPLATE.name, blocks: [] } }];
    }
  };
  return __toCommonJS(import_magazine_article_exports);
})();
