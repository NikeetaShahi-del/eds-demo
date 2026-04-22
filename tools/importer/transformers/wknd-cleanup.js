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
    // Convert <blockquote> to <em> paragraphs (blockquote not supported by md2jcr)
    element.querySelectorAll('blockquote').forEach((bq) => {
      const wrapper = document.createElement('div');
      const children = [...bq.childNodes];
      children.forEach((child) => {
        if (child.nodeType === 1 && child.tagName === 'P') {
          const em = document.createElement('em');
          em.textContent = child.textContent;
          const p = document.createElement('p');
          p.appendChild(em);
          wrapper.appendChild(p);
        } else if (child.nodeType === 3 && child.textContent.trim()) {
          const em = document.createElement('em');
          em.textContent = child.textContent.trim();
          const p = document.createElement('p');
          p.appendChild(em);
          wrapper.appendChild(p);
        } else {
          wrapper.appendChild(child.cloneNode(true));
        }
      });
      bq.replaceWith(wrapper);
    });

    // Remove breadcrumb <ol> from content (EDS header handles breadcrumbs)
    element.querySelectorAll('.breadcrumb, .cmp-breadcrumb').forEach((bc) => bc.remove());
    // Also remove standalone breadcrumb-like <ol> at start of main content
    const firstOl = element.querySelector('main ol:first-child, .cmp-container > .aem-Grid > ol:first-child');
    if (firstOl) {
      const items = firstOl.querySelectorAll('li');
      const looksLikeBreadcrumb = items.length <= 4 && [...items].some((li) => li.querySelector('a'));
      if (looksLikeBreadcrumb) firstOl.remove();
    }

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
