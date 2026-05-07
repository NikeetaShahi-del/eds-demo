export default function decorate(block) {
  const allHeroes = document.querySelectorAll('.hero');
  const isFirst = allHeroes.length > 0 && allHeroes[0] === block;

  if (isFirst) {
    block.classList.add('hero-featured');
  } else {
    block.classList.add('hero-banner');
    const section = block.closest('[data-aue-type="container"]') || block.parentElement;
    if (section) {
      section.classList.add('hero-banner-section');
    }

    const existingStyle = document.querySelector('link[href*="styles/styles.css"]');
    const basePath = existingStyle
      ? existingStyle.href.replace('styles/styles.css', '')
      : '/';

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${basePath}styles/next-adventures.css`;
    document.head.appendChild(link);
  }
}
