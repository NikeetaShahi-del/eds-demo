export default function decorate(block) {
  const section = block.closest('[data-aue-type="container"]') || block.parentElement;
  const siblings = section ? section.querySelectorAll(':scope > *:not(style):not(script)') : [];
  const isOnlyBlock = siblings.length <= 2;

  if (isOnlyBlock) {
    block.classList.add('hero-banner');
  } else {
    block.classList.add('hero-featured');
  }
}
