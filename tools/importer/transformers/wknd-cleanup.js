/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND cleanup. Selectors from captured DOM of https://wknd.site/us/en.html
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Remove cookie/tracking iframes and analytics pixels (from captured DOM)
    WebImporter.DOMUtils.remove(element, [
      'iframe[title="Adobe ID Syncing iFrame"]',
      'img[src*="demdex.net"]',
      'img[src*="2o7.net"]',
    ]);
  }
  if (hookName === H.after) {
    // Remove non-authorable content: header, footer, mobile nav (from captured DOM)
    WebImporter.DOMUtils.remove(element, [
      'header.experiencefragment',
      'footer.experiencefragment',
      '#toggleNav',
      '#mobileNav',
      '.cmp-navigation--mobile',
      'noscript',
      'link',
    ]);
    // Clean up tracking attributes
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('data-cmp-data-layer-enabled');
      el.removeAttribute('data-cmp-data-layer-name');
      el.removeAttribute('data-cmp-link-accessibility-enabled');
      el.removeAttribute('data-cmp-link-accessibility-text');
    });
  }
}
