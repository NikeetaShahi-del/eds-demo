export default function decorate(block) {
  const contentDiv = block.querySelector(':scope > div:last-child > div');
  const hasPreTitle = contentDiv && contentDiv.querySelector(':scope > p:first-child strong');

  if (hasPreTitle) {
    block.classList.add('hero-featured');
  } else {
    block.classList.add('hero-banner');
    const section = block.closest('[data-aue-type="container"]') || block.parentElement;
    if (section) {
      section.classList.add('hero-banner-section');
    }
  }
}
