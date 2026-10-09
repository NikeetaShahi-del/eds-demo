export default function decorate(block) {
  const [photoCell, contentCell] = [...block.children[0].children];

  const photo = document.createElement('div');
  photo.className = 'author-byline-photo';
  if (photoCell) photo.append(...photoCell.childNodes);

  const content = document.createElement('div');
  content.className = 'author-byline-content';

  if (contentCell) {
    const nodes = [...contentCell.childNodes];
    const nameEl = nodes.find((n) => /^H[2-3]$/i.test(n.nodeName));
    if (nameEl) nameEl.className = 'author-byline-name';

    const socialLinks = [];
    nodes.forEach((n) => {
      if (n.nodeName === 'P' && n.querySelector('a')) {
        n.classList.add('author-byline-social');
        socialLinks.push(n);
      }
    });

    const socialWrapper = document.createElement('div');
    socialWrapper.className = 'author-byline-social-links';
    socialLinks.forEach((l) => socialWrapper.append(l));

    nodes.forEach((n) => {
      if (!socialLinks.includes(n)) content.append(n);
    });
    content.append(socialWrapper);
  }

  block.textContent = '';
  block.append(photo, content);
}
