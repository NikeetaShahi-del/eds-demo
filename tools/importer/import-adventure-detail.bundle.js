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

  // tools/importer/parsers/carousel-mini.js
  function parse(element, { document: document2 }) {
    const slides = element.querySelectorAll(".cmp-carousel__item");
    const cells = [];
    slides.forEach((slide) => {
      const img = slide.querySelector("img");
      const imageCell = document2.createDocumentFragment();
      imageCell.appendChild(document2.createComment(" field:media_image "));
      if (img) {
        const picture = document2.createElement("picture");
        const newImg = document2.createElement("img");
        newImg.src = img.src;
        newImg.alt = img.alt || "";
        picture.appendChild(newImg);
        imageCell.appendChild(picture);
      }
      const contentCell = document2.createDocumentFragment();
      contentCell.appendChild(document2.createComment(" field:content_text "));
      const p = document2.createElement("p");
      p.textContent = img ? img.alt || "" : "";
      contentCell.appendChild(p);
      cells.push([imageCell, contentCell]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs.js
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
      if (panels[i]) {
        contentCell.appendChild(document2.createComment(" field:content_heading "));
        const heading = panels[i].querySelector("h3, h4, h5, h6");
        if (heading) {
          const h = document2.createElement(heading.tagName.toLowerCase());
          h.textContent = heading.textContent.trim();
          contentCell.appendChild(h);
        } else {
          const h3 = document2.createElement("h3");
          h3.textContent = label;
          contentCell.appendChild(h3);
        }
        const firstImg = panels[i].querySelector("img");
        if (firstImg) {
          contentCell.appendChild(document2.createComment(" field:content_image "));
          const picture = document2.createElement("picture");
          const newImg = document2.createElement("img");
          newImg.src = firstImg.src;
          newImg.alt = firstImg.alt || "";
          picture.appendChild(newImg);
          contentCell.appendChild(picture);
        }
        contentCell.appendChild(document2.createComment(" field:content_richtext "));
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
    const block = WebImporter.Blocks.createBlock(document2, { name: "tabs", cells });
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

  // tools/importer/import-adventure-detail.js
  var parsers = {
    "carousel": parse,
    "tabs": parse2
  };
  var PAGE_TEMPLATE = {
    name: "adventure-detail",
    blocks: [
      { name: "carousel", instances: [".carousel.cmp-carousel--mini"] },
      { name: "tabs", instances: [".tabs.panelcontainer"] }
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
  var import_adventure_detail_default = {
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
  return __toCommonJS(import_adventure_detail_exports);
})();
