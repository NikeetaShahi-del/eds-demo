/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND site-wide cleanup.
 * Removes non-authorable content (header/footer experience fragments, mobile nav,
 * tracking iframes, sign-in UI, search widget) so only page-level authorable
 * content remains after import.
 *
 * All selectors sourced from migration-work/cleaned.html captured DOM.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove tracking/analytics iframe (demdex.net) -- found as iframe#destination_publishing_iframe_wkndsite_0
    WebImporter.DOMUtils.remove(element, [
      'iframe#destination_publishing_iframe_wkndsite_0',
      'iframe[src*="demdex.net"]',
    ]);

    // Remove orphan <meta> tags inside teaser image containers -- found in .cmp-image > meta
    const orphanMeta = element.querySelectorAll('.cmp-image > meta');
    orphanMeta.forEach((el) => el.remove());
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove header experience fragment -- found as header.experiencefragment.cmp-experiencefragment--header
    WebImporter.DOMUtils.remove(element, [
      'header.experiencefragment.cmp-experiencefragment--header',
    ]);

    // Remove footer experience fragment -- found as footer.experiencefragment.cmp-experiencefragment--footer
    WebImporter.DOMUtils.remove(element, [
      'footer.experiencefragment.cmp-experiencefragment--footer',
    ]);

    // Remove mobile navigation toggle and mobile nav -- found as #toggleNav and #mobileNav
    WebImporter.DOMUtils.remove(element, [
      '#toggleNav',
      '#mobileNav',
    ]);

    // Remove remaining iframes, link elements, noscript -- safe non-authorable elements
    WebImporter.DOMUtils.remove(element, [
      'iframe',
      'link',
      'noscript',
    ]);

    // Clean data-layer and tracking attributes from all elements
    element.querySelectorAll('[data-cmp-data-layer-enabled]').forEach((el) => {
      el.removeAttribute('data-cmp-data-layer-enabled');
    });
    element.querySelectorAll('[data-cmp-data-layer-name]').forEach((el) => {
      el.removeAttribute('data-cmp-data-layer-name');
    });
    element.querySelectorAll('[data-cmp-link-accessibility-enabled]').forEach((el) => {
      el.removeAttribute('data-cmp-link-accessibility-enabled');
    });
    element.querySelectorAll('[data-cmp-link-accessibility-text]').forEach((el) => {
      el.removeAttribute('data-cmp-link-accessibility-text');
    });
  }
}
