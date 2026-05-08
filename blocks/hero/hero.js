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

      let sibling = block.nextElementSibling;
      while (sibling) {
        sibling.style.paddingLeft = '8%';
        sibling.style.paddingRight = '8%';
        sibling.style.boxSizing = 'border-box';
        sibling = sibling.nextElementSibling;
      }
    }
  }
}
