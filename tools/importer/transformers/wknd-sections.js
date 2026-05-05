/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND section breaks.
 * Inserts <hr> section breaks between the 4 homepage sections based on
 * template section selectors from page-templates.json. Also inserts
 * Section Metadata blocks for sections that define a style.
 *
 * Sections (from page-templates.json homepage template):
 *   1. Hero Carousel:                .carousel.panelcontainer.cmp-carousel--hero
 *   2. Featured and Recent Articles: main.container.responsivegrid.cmp-layout-container--fixed
 *   3. Climbing New Zealand Hero:    .teaser.cmp-teaser--hero.cmp-teaser--imagebottom
 *   4. Adventures:                   main.container.responsivegrid.cmp-layout-container--fixed:last-of-type
 *
 * All selectors sourced from migration-work/cleaned.html captured DOM.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const { document } = element.ownerDocument ? { document: element.ownerDocument } : { document: element.getRootNode() };
    const sections = payload && payload.template && payload.template.sections;

    if (!sections || sections.length < 2) {
      return;
    }

    // Process sections in reverse order to avoid DOM position shifts
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      const sectionEl = element.querySelector(section.selector);

      if (!sectionEl) {
        continue;
      }

      // Insert Section Metadata block if section has a style
      if (section.style) {
        const sectionMetadata = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        sectionEl.after(sectionMetadata);
      }

      // Insert <hr> before each section except the first
      if (i > 0) {
        const hr = document.createElement('hr');
        sectionEl.before(hr);
      }
    }
  }
}
