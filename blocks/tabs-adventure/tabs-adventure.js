import { moveInstrumentation } from '../../scripts/scripts.js';

let tabBlockCnt = 0;

function buildCardGrid(panel) {
  const contentDiv = panel.querySelector(':scope > div:last-child');
  if (!contentDiv) return;

  const h3 = contentDiv.querySelector('h3');
  if (h3) h3.remove();

  const existingPicture = contentDiv.querySelector('picture');
  if (existingPicture) {
    const pp = existingPicture.closest('p') || existingPicture.parentElement;
    if (pp && pp !== contentDiv) pp.remove();
  }

  const paragraphs = [...contentDiv.querySelectorAll(':scope > p, :scope > [data-richtext-prop] p')];
  const allP = [...contentDiv.querySelectorAll('p')];

  const cards = [];
  let i = 0;
  while (i < allP.length) {
    const p = allP[i];

    const damLink = p.querySelector('a[href*="/content/dam/"]');
    if (damLink) {
      const damPath = damLink.getAttribute('href');
      i += 1;

      const titleP = allP[i];
      const descP = allP[i + 1];
      const link = titleP ? titleP.querySelector('a') : null;

      if (link) {
        const card = document.createElement('div');
        card.className = 'adventure-card';

        const imgDiv = document.createElement('div');
        imgDiv.className = 'adventure-card-image';
        const img = document.createElement('img');
        img.src = damPath;
        img.alt = link.textContent;
        img.loading = 'lazy';
        imgDiv.appendChild(img);
        card.appendChild(imgDiv);

        const titleEl = document.createElement('p');
        titleEl.className = 'adventure-card-title';
        const a = document.createElement('a');
        a.href = link.href;
        a.textContent = link.textContent;
        titleEl.appendChild(a);
        card.appendChild(titleEl);

        if (descP && !descP.querySelector('a[href*="/content/dam/"]') && !descP.querySelector('strong > a')) {
          const descEl = document.createElement('p');
          descEl.className = 'adventure-card-desc';
          descEl.textContent = descP.textContent;
          card.appendChild(descEl);
          i += 2;
        } else {
          i += 1;
        }

        cards.push(card);
      } else {
        i += 1;
      }
      continue;
    }

    const titleLink = p.querySelector('strong > a');
    if (titleLink) {
      const card = document.createElement('div');
      card.className = 'adventure-card';

      const titleEl = document.createElement('p');
      titleEl.className = 'adventure-card-title';
      const a = document.createElement('a');
      a.href = titleLink.href;
      a.textContent = titleLink.textContent;
      titleEl.appendChild(a);
      card.appendChild(titleEl);

      const descP2 = allP[i + 1];
      if (descP2 && !descP2.querySelector('strong > a') && !descP2.querySelector('a[href*="/content/dam/"]')) {
        const descEl = document.createElement('p');
        descEl.className = 'adventure-card-desc';
        descEl.textContent = descP2.textContent;
        card.appendChild(descEl);
        i += 2;
      } else {
        i += 1;
      }

      cards.push(card);
      continue;
    }

    i += 1;
  }

  contentDiv.innerHTML = '';

  const grid = document.createElement('div');
  grid.className = 'adventure-card-grid';
  cards.forEach((c) => grid.appendChild(c));
  contentDiv.appendChild(grid);
}

export default async function decorate(block) {
  const tablist = document.createElement('div');
  tablist.className = 'tabs-adventure-list';
  tablist.setAttribute('role', 'tablist');
  tablist.id = `tablist-${tabBlockCnt += 1}`;

  const tabHeadings = [...block.children]
    .filter((child) => child.firstElementChild && child.firstElementChild.children.length > 0)
    .map((child) => child.firstElementChild);

  tabHeadings.forEach((tab, idx) => {
    const id = `tabpanel-${tabBlockCnt}-tab-${idx + 1}`;

    const tabpanel = block.children[idx];
    tabpanel.className = 'tabs-adventure-panel';
    tabpanel.id = id;
    tabpanel.setAttribute('aria-hidden', !!idx);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');

    buildCardGrid(tabpanel);

    const button = document.createElement('button');
    button.className = 'tabs-adventure-tab';
    button.id = `tab-${id}`;
    button.innerHTML = tab.innerHTML;
    button.setAttribute('aria-controls', id);
    button.setAttribute('aria-selected', !idx);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');

    button.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((p2) => {
        p2.setAttribute('aria-hidden', true);
      });
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
      });
      tabpanel.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
    });

    tablist.append(button);
    tab.remove();

    if (button.firstElementChild) {
      moveInstrumentation(button.firstElementChild, null);
    }
  });

  block.prepend(tablist);
}
