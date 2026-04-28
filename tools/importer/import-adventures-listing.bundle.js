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

  // tools/importer/parsers/hero-teaser.js
  function parse(element, { document: document2 }) {
    const img = element.querySelector(".cmp-teaser__image img, .cmp-image__image");
    const imageCell = document2.createDocumentFragment();
    imageCell.appendChild(document2.createComment(" field:image "));
    if (img) {
      const picture = document2.createElement("picture");
      const newImg = document2.createElement("img");
      newImg.src = img.src;
      newImg.alt = img.alt || "";
      picture.appendChild(newImg);
      imageCell.appendChild(picture);
    }
    const textCell = document2.createDocumentFragment();
    textCell.appendChild(document2.createComment(" field:text "));
    const heading = element.querySelector(".cmp-teaser__title");
    if (heading) {
      const h2 = document2.createElement("h2");
      h2.textContent = heading.textContent.trim();
      textCell.appendChild(h2);
    }
    const desc = element.querySelector(".cmp-teaser__description");
    if (desc) {
      const p = document2.createElement("p");
      p.textContent = desc.textContent.trim();
      textCell.appendChild(p);
    }
    const cta = element.querySelector(".cmp-teaser__action-link");
    if (cta) {
      const p = document2.createElement("p");
      const a = document2.createElement("a");
      a.href = cta.href;
      a.textContent = cta.textContent.trim();
      p.appendChild(a);
      textCell.appendChild(p);
    }
    const cells = [
      [imageCell],
      [textCell]
    ];
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-with-cards.js
  function parse2(element, { document: document2 }) {
    const tabsEl = element.querySelector(".cmp-tabs") || element;
    const tabs = tabsEl.querySelectorAll(".cmp-tabs__tab");
    const panels = tabsEl.querySelectorAll(".cmp-tabs__tabpanel");
    const cells = [];
    tabs.forEach((tab, i) => {
      const label = tab.textContent.trim();
      const titleCell = document2.createDocumentFragment();
      titleCell.appendChild(document2.createComment(" field:title "));
      const titleP = document2.createElement("p");
      titleP.textContent = label;
      titleCell.appendChild(titleP);
      const contentCell = document2.createDocumentFragment();
      contentCell.appendChild(document2.createComment(" field:content_heading "));
      const h3 = document2.createElement("h3");
      h3.textContent = label;
      contentCell.appendChild(h3);
      if (panels[i]) {
        const imageList = panels[i].querySelector(".cmp-image-list");
        if (imageList) {
          const items = imageList.querySelectorAll(".cmp-image-list__item");
          const cardCells = [];
          items.forEach((item) => {
            const img = item.querySelector("img");
            const imageCell = document2.createDocumentFragment();
            imageCell.appendChild(document2.createComment(" field:image "));
            if (img) {
              const picture = document2.createElement("picture");
              const newImg = document2.createElement("img");
              newImg.src = img.src;
              newImg.alt = img.alt || "";
              picture.appendChild(newImg);
              imageCell.appendChild(picture);
            }
            const textCell = document2.createDocumentFragment();
            textCell.appendChild(document2.createComment(" field:text "));
            const titleEl = item.querySelector(
              ".cmp-image-list__item-title"
            );
            const titleLink = item.querySelector(
              ".cmp-image-list__item-title-link"
            );
            if (titleEl) {
              const p = document2.createElement("p");
              if (titleLink) {
                const a = document2.createElement("a");
                a.href = titleLink.href;
                a.textContent = titleEl.textContent.trim();
                const strong = document2.createElement("strong");
                strong.appendChild(a);
                p.appendChild(strong);
              } else {
                const strong = document2.createElement("strong");
                strong.textContent = titleEl.textContent.trim();
                p.appendChild(strong);
              }
              textCell.appendChild(p);
            }
            const desc = item.querySelector(
              ".cmp-image-list__item-description"
            );
            if (desc) {
              const p = document2.createElement("p");
              p.textContent = desc.textContent.trim();
              textCell.appendChild(p);
            }
            cardCells.push([imageCell, textCell]);
          });
          const cardsBlock = WebImporter.Blocks.createBlock(
            document2,
            { name: "cards-article", cells: cardCells }
          );
          contentCell.appendChild(
            document2.createComment(" field:content_richtext ")
          );
          contentCell.appendChild(cardsBlock);
        }
      }
      cells.push([titleCell, contentCell]);
    });
    const block = WebImporter.Blocks.createBlock(
      document2,
      { name: "tabs", cells }
    );
    element.replaceWith(block);
  }

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

  // tools/importer/import-adventures-listing.js
  var parsers = {
    "hero": parse,
    "tabs": parse2
  };
  var PAGE_TEMPLATE = {
    name: "adventures-listing",
    blocks: [
      { name: "hero", instances: [".teaser:not(.cmp-teaser--featured):not(.cmp-teaser--hero):not(.cmp-teaser--list)"] },
      { name: "tabs", instances: [".cmp-tabs"] }
    ],
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
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        document2.querySelectorAll(selector).forEach((element) => {
          pageBlocks.push({ name: blockDef.name, selector, element });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_adventures_listing_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(e);
          }
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, ""));
      return [{ element: main, path, report: { title: document2.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) } }];
    }
  };
  return __toCommonJS(import_adventures_listing_exports);
})();
