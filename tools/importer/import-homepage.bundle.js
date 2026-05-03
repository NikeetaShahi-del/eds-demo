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

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/carousel-hero.js
  function parse(element, { document: document2 }) {
    const slides = element.querySelectorAll(".cmp-carousel__item");
    const cells = [];
    slides.forEach((slide) => {
      const teaser = slide.querySelector(".cmp-teaser");
      if (!teaser) return;
      const img = teaser.querySelector(".cmp-teaser__image img, .cmp-image__image");
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
      const heading = teaser.querySelector(".cmp-teaser__title");
      if (heading) {
        const h2 = document2.createElement("h2");
        h2.textContent = heading.textContent.trim();
        contentCell.appendChild(h2);
      }
      const desc = teaser.querySelector(".cmp-teaser__description");
      if (desc) {
        const p = document2.createElement("p");
        p.textContent = desc.textContent.trim();
        contentCell.appendChild(p);
      }
      const cta = teaser.querySelector(".cmp-teaser__action-link");
      if (cta) {
        const p = document2.createElement("p");
        const a = document2.createElement("a");
        a.href = cta.href;
        a.textContent = cta.textContent.trim();
        p.appendChild(a);
        contentCell.appendChild(p);
      }
      cells.push([imageCell, contentCell]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-featured.js
  function parse2(element, { document: document2 }) {
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
    const pretitle = element.querySelector(".cmp-teaser__pretitle");
    if (pretitle) {
      const p = document2.createElement("p");
      p.textContent = pretitle.textContent.trim();
      textCell.appendChild(p);
    }
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
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-featured", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-article.js
  function parse3(element, { document: document2 }) {
    const items = element.querySelectorAll(".cmp-image-list__item");
    const cells = [];
    items.forEach((item) => {
      const img = item.querySelector(".cmp-image-list__item-image img, .cmp-image__image");
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
      const titleEl = item.querySelector(".cmp-image-list__item-title");
      const titleLink = item.querySelector(".cmp-image-list__item-title-link");
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
      const desc = item.querySelector(".cmp-image-list__item-description");
      if (desc) {
        const p = document2.createElement("p");
        p.textContent = desc.textContent.trim();
        textCell.appendChild(p);
      }
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-article", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-adventure.js
  function parse4(element, { document: document2 }) {
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
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-adventure", cells });
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

  // tools/importer/transformers/wknd-sections.js
  var H2 = { before: "beforeTransform", after: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === H2.after) {
      const { document: document2 } = payload;
      const sections = payload.template && payload.template.sections;
      if (!sections || sections.length < 2) return;
      const reversedSections = [...sections].reverse();
      for (const section of reversedSections) {
        const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
        let sectionEl = null;
        for (const sel of selectors) {
          sectionEl = element.querySelector(sel);
          if (sectionEl) break;
        }
        if (!sectionEl) continue;
        if (section.style) {
          const sectionMetadata = WebImporter.Blocks.createBlock(document2, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.after(sectionMetadata);
        }
        if (section.id !== sections[0].id) {
          const hr = document2.createElement("hr");
          sectionEl.before(hr);
        }
      }
    }
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "carousel-hero": parse,
    "hero-featured": parse2,
    "cards-article": parse3,
    "hero-adventure": parse4
  };
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "WKND homepage with hero carousel, featured articles, adventure cards, and CTA sections",
    urls: [
      "https://wknd.site/us/en.html"
    ],
    blocks: [
      {
        name: "carousel-hero",
        instances: [".carousel.cmp-carousel--hero"]
      },
      {
        name: "hero-featured",
        instances: [".teaser.cmp-teaser--featured"]
      },
      {
        name: "cards-article",
        instances: [".image-list.list"]
      },
      {
        name: "hero-adventure",
        instances: [".teaser.cmp-teaser--hero.cmp-teaser--imagebottom"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Hero Carousel",
        selector: ".carousel.cmp-carousel--hero",
        style: null,
        blocks: ["carousel-hero"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "Featured and Recent Articles",
        selector: "main.cmp-layout-container--fixed:first-of-type",
        style: null,
        blocks: ["hero-featured", "cards-article"],
        defaultContent: [".title.cmp-title--underline h2", ".button.cmp-button--primary a", ".separator hr"]
      },
      {
        id: "section-3",
        name: "Climbing New Zealand Hero",
        selector: ".teaser.cmp-teaser--hero.cmp-teaser--imagebottom",
        style: null,
        blocks: ["hero-adventure"],
        defaultContent: []
      },
      {
        id: "section-4",
        name: "Adventures",
        selector: "main.cmp-layout-container--fixed:last-of-type",
        style: null,
        blocks: ["cards-article"],
        defaultContent: [".title h3", ".button.cmp-button--primary a", ".separator hr"]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
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
  var import_homepage_default = {
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
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
