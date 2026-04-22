// eslint-disable-next-line import/no-unresolved
import {
  moveInstrumentation,
} from '../../scripts/scripts.js';
import {
  decorateBlock,
  loadBlock,
} from '../../scripts/aem.js';

// keep track globally of the number of tab blocks on the page
let tabBlockCnt = 0;

/**
 * Convert block tables inside an element into decorated block divs.
 * EDS only auto-decorates top-level blocks; nested ones need manual handling.
 */
async function decorateNestedBlocks(container) {
  const tables = container.querySelectorAll('table');
  const blockPromises = [];

  tables.forEach((table) => {
    const header = table.querySelector('th');
    if (!header) return;

    const blockName = header.textContent.trim().toLowerCase().replace(/\s+/g, '-');
    if (!blockName) return;

    // Build block div from table rows
    const blockEl = document.createElement('div');
    blockEl.classList.add(blockName);

    const rows = table.querySelectorAll('tbody tr');
    rows.forEach((row) => {
      const rowEl = document.createElement('div');
      row.querySelectorAll('td').forEach((cell) => {
        const colEl = document.createElement('div');
        colEl.innerHTML = cell.innerHTML;
        rowEl.appendChild(colEl);
      });
      blockEl.appendChild(rowEl);
    });

    // Wrap in block wrapper
    const wrapper = document.createElement('div');
    wrapper.classList.add(`${blockName}-wrapper`);
    wrapper.appendChild(blockEl);

    table.replaceWith(wrapper);

    // Decorate and load the block
    decorateBlock(blockEl);
    blockPromises.push(loadBlock(blockEl));
  });

  await Promise.all(blockPromises);
}

export default async function decorate(block) {
  // build tablist
  const tablist = document.createElement('div');
  tablist.className = 'tabs-list';
  tablist.setAttribute('role', 'tablist');
  tablist.id = `tablist-${tabBlockCnt += 1}`;

  // the first cell of each row is the title of the tab
  const tabHeadings = [...block.children]
    .filter((child) => child.firstElementChild
      && child.firstElementChild.children.length > 0)
    .map((child) => child.firstElementChild);

  tabHeadings.forEach((tab, i) => {
    const id = `tabpanel-${tabBlockCnt}-tab-${i + 1}`;

    // decorate tabpanel
    const tabpanel = block.children[i];
    tabpanel.className = 'tabs-panel';
    tabpanel.id = id;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');

    // build tab button
    const button = document.createElement('button');
    button.className = 'tabs-tab';
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

    // add the new tab list button, to the tablist
    tablist.append(button);

    // remove the tab heading from the dom
    tab.remove();

    // remove the instrumentation from the button's children
    if (button.firstElementChild) {
      moveInstrumentation(button.firstElementChild, null);
    }
  });

  block.prepend(tablist);

  // Decorate any nested blocks (e.g. cards-article tables) inside panels
  await decorateNestedBlocks(block);
}
