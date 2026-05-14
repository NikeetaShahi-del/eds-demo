import { moveInstrumentation } from '../../scripts/scripts.js';

let tabBlockCnt = 0;

function buildCardGrid(panel) {
  const contentDiv = panel.querySelector(':scope > div:last-child');
  if (!contentDiv) return;

  const h3 = contentDiv.querySelector('h3');
  if (h3) h3.remove();

  const picture = contentDiv.querySelector('picture');
  if (picture) {
    const picParent = picture.closest('p') || picture.parentElement;
    if (picParent && picParent !== contentDiv) picParent.remove();
  }

  const damLink = contentDiv.querySelector('p > a[href*="/content/dam/"]');
  if (damLink) {
    const linkParent = damLink.closest('p');
    if (linkParent) linkParent.remove();
  }

  const paragraphs = [...contentDiv.querySelectorAll('p')];
  const cards = [];
  for (let i = 0; i < paragraphs.length; i += 2) {
    const titleP = paragraphs[i];
    const descP = paragraphs[i + 1];
    const link = titleP ? titleP.querySelector('a') : null;
    if (link) {
      const card = document.createElement('div');
      card.className = 'adventure-card';

      const titleEl = document.createElement('p');
      titleEl.className = 'adventure-card-title';
      titleEl.textContent = link.textContent;
      const a = document.createElement('a');
      a.href = link.href;
      a.textContent = link.textContent;
      titleEl.textContent = '';
      titleEl.appendChild(a);

      card.appendChild(titleEl);

      if (descP) {
        const descEl = document.createElement('p');
        descEl.className = 'adventure-card-desc';
        descEl.textContent = descP.textContent;
        card.appendChild(descEl);
      }
      cards.push(card);
    }
  }

  paragraphs.forEach((p) => p.remove());

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

  tabHeadings.forEach((tab, i) => {
    const id = `tabpanel-${tabBlockCnt}-tab-${i + 1}`;

    const tabpanel = block.children[i];
    tabpanel.className = 'tabs-adventure-panel';
    tabpanel.id = id;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');

    buildCardGrid(tabpanel);

    const button = document.createElement('button');
    button.className = 'tabs-adventure-tab';
    button.id = `tab-${id}`;
    button.innerHTML = tab.innerHTML;
    button.setAttribute('aria-controls', id);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');

    button.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
        panel.setAttribute('aria-hidden', true);
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
