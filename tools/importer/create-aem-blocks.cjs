const { readFileSync, readdirSync, statSync } = require('fs');
const { join, relative } = require('path');
const { JSDOM } = require('jsdom');

const AEM_HOST = process.env.AEM_HOST || 'https://author-p11300-e47725.adobeaemcloud.com';
const TOKEN = process.env.AEM_TOKEN;
const CONTENT_ROOT = '/content/eds-demo';

if (!TOKEN) { console.error('Set AEM_TOKEN'); process.exit(1); }

async function post(path, data) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(data)) params.append(k, v);
  const resp = await fetch(`${AEM_HOST}${path}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}` },
    body: params,
  });
  return resp.status;
}

async function deleteNode(p) { return post(p, { ':operation': 'delete' }); }
async function createNode(p, props) { return post(p, { 'jcr:primaryType': 'nt:unstructured', ...props }); }

function parseContent(htmlPath) {
  const html = readFileSync(htmlPath, 'utf-8');
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const blocks = [];
  const defaultContent = [];
  const container = doc.querySelector('body > div') || doc.body;
  
  for (const el of container.children) {
    if (el.classList.length > 0 && el.tagName === 'DIV') {
      const blockName = el.classList[0];
      if (blockName === 'metadata') continue;
      blocks.push({ name: blockName, element: el });
    } else if (['H1','H2','H3','H4','H5'].includes(el.tagName)) {
      defaultContent.push({ type: 'title', tag: el.tagName.toLowerCase(), text: el.textContent.trim() });
    } else if (el.tagName === 'P' && el.querySelector('img')) {
      const img = el.querySelector('img');
      defaultContent.push({ type: 'image', src: img.getAttribute('src') || '', alt: img.getAttribute('alt') || '' });
    } else if (el.tagName === 'P') {
      defaultContent.push({ type: 'text', html: el.outerHTML });
    } else if (['UL','OL'].includes(el.tagName)) {
      defaultContent.push({ type: 'text', html: el.outerHTML });
    }
  }
  return { blocks, defaultContent };
}

function extractItems(el, type) {
  const items = [];
  for (const row of el.children) {
    if (row.tagName !== 'DIV') continue;
    const cells = row.querySelectorAll(':scope > div');
    if (cells.length < 2 && type !== 'carousel') continue;
    
    if (type === 'accordion') {
      items.push({ summary: cells[0].textContent.trim(), text: cells[1].innerHTML });
    } else if (type === 'tabs') {
      const contentEl = cells[1];
      const heading = contentEl.querySelector('h3,h4,h5,h6');
      const img = contentEl.querySelector('img');
      const rts = [];
      for (const c of contentEl.children) {
        if (c === heading || (c.tagName === 'P' && c.querySelector('img') && c.children.length === 1)) continue;
        rts.push(c.outerHTML);
      }
      items.push({
        title: cells[0].textContent.trim(),
        content_heading: heading ? heading.textContent.trim() : cells[0].textContent.trim(),
        content_headingType: heading ? heading.tagName.toLowerCase() : 'h3',
        content_image: img ? (img.getAttribute('src') || '') : '',
        content_richtext: rts.join(''),
      });
    } else if (type === 'carousel' || type === 'carousel-hero') {
      const img = (cells[0] || row).querySelector('img');
      const text = cells.length >= 2 ? cells[1].innerHTML : '';
      items.push({
        media_image: img ? (img.getAttribute('src') || '') : '',
        media_imageAlt: img ? (img.getAttribute('alt') || '') : '',
        content_text: text,
      });
    } else if (type === 'cards') {
      const img = cells[0].querySelector('img');
      items.push({
        image: img ? (img.getAttribute('src') || '') : '',
        imageAlt: img ? (img.getAttribute('alt') || '') : '',
        text: cells[1].innerHTML,
      });
    }
  }
  return items;
}

function extractHero(el) {
  const rows = el.querySelectorAll(':scope > div');
  let image = '', imageAlt = '', text = '';
  if (rows.length >= 1) {
    const img = rows[0].querySelector('img');
    if (img) { image = img.getAttribute('src') || ''; imageAlt = img.getAttribute('alt') || ''; }
  }
  if (rows.length >= 2) text = rows[1].innerHTML;
  return { image, imageAlt, text };
}

const BLOCK_CONFIG = {
  'accordion':     { displayName: 'Accordion', filter: 'accordion', itemModel: 'accordion-item', itemName: 'Accordion Item', itemType: 'accordion' },
  'tabs':          { displayName: 'Tabs', filter: 'tabs', itemModel: 'tabs-item', itemName: 'Tab', itemType: 'tabs' },
  'carousel-hero': { displayName: 'Carousel Hero', filter: 'carousel-hero', itemModel: 'carousel-hero-item', itemName: 'Carousel Hero Slide', itemType: 'carousel-hero' },
  'carousel':      { displayName: 'Carousel', filter: 'carousel', itemModel: 'carousel-item', itemName: 'Carousel Slide', itemType: 'carousel' },
  'cards-article': { displayName: 'Cards Article', filter: 'cards-article', itemModel: 'card', itemName: 'Card', itemType: 'cards' },
  'cards':         { displayName: 'Cards', filter: 'cards', itemModel: 'card', itemName: 'Card', itemType: 'cards' },
};

const HERO_BLOCKS = {
  'hero-featured':  { displayName: 'Hero Featured', model: 'hero-featured' },
  'hero-adventure': { displayName: 'Hero Adventure', model: 'hero-adventure' },
  'hero':           { displayName: 'Hero', model: 'hero' },
};

async function createPageBlocks(pagePath, htmlPath) {
  const { blocks, defaultContent } = parseContent(htmlPath);
  const sectionPath = `${pagePath}/jcr:content/root/section`;
  
  await deleteNode(sectionPath);
  await createNode(sectionPath, {
    'sling:resourceType': 'core/franklin/components/section/v1/section',
    'model': 'section',
  });

  let idx = 0;
  
  for (const dc of defaultContent) {
    const name = `${dc.type}_${idx++}`;
    if (dc.type === 'title') {
      await createNode(`${sectionPath}/${name}`, {
        'sling:resourceType': 'core/franklin/components/title/v1/title',
        'jcr:title': dc.text, 'titleType': dc.tag,
      });
    } else if (dc.type === 'image') {
      await createNode(`${sectionPath}/${name}`, {
        'sling:resourceType': 'core/franklin/components/image/v1/image',
        'image': dc.src, 'imageAlt': dc.alt,
      });
    } else if (dc.type === 'text') {
      await createNode(`${sectionPath}/${name}`, {
        'sling:resourceType': 'core/franklin/components/text/v1/text',
        'text': dc.html,
      });
    }
  }

  for (const block of blocks) {
    const bName = `block_${idx++}`;
    const bPath = `${sectionPath}/${bName}`;
    
    if (BLOCK_CONFIG[block.name]) {
      const cfg = BLOCK_CONFIG[block.name];
      await createNode(bPath, {
        'sling:resourceType': 'core/franklin/components/block/v1/block',
        'name': cfg.displayName, 'filter': cfg.filter,
      });
      const items = extractItems(block.element, cfg.itemType);
      for (let i = 0; i < items.length; i++) {
        await createNode(`${bPath}/item_${i}`, {
          'sling:resourceType': 'core/franklin/components/block/v1/block/item',
          'name': cfg.itemName, 'model': cfg.itemModel,
          ...items[i],
        });
      }
    } else if (HERO_BLOCKS[block.name]) {
      const cfg = HERO_BLOCKS[block.name];
      const fields = extractHero(block.element);
      await createNode(bPath, {
        'sling:resourceType': 'core/franklin/components/block/v1/block',
        'name': cfg.displayName, 'model': cfg.model,
        ...fields,
      });
    } else {
      await createNode(bPath, {
        'sling:resourceType': 'core/franklin/components/block/v1/block',
        'name': block.name.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' '),
      });
    }
  }
  
  return { blocks: blocks.length, defaultContent: defaultContent.length };
}

function findFiles(dir, pattern) {
  const results = [];
  for (const f of readdirSync(dir)) {
    const full = join(dir, f);
    if (statSync(full).isDirectory()) results.push(...findFiles(full, pattern));
    else if (full.endsWith(pattern)) results.push(full);
  }
  return results;
}

(async () => {
  const files = findFiles('content', '.plain.html')
    .filter(f => !f.endsWith('nav.plain.html') && !f.endsWith('footer.plain.html'));
  
  console.log(`Processing ${files.length} pages...`);
  let ok = 0, fail = 0;
  
  for (const file of files) {
    const relPath = relative('content', file).replace('.plain.html', '').replace(/\\/g, '/');
    const pagePath = `${CONTENT_ROOT}/${relPath}`;
    try {
      const r = await createPageBlocks(pagePath, file);
      console.log(`✅ ${relPath} (${r.defaultContent}dc + ${r.blocks}blk)`);
      ok++;
    } catch (e) {
      console.error(`❌ ${relPath}: ${e.message}`);
      fail++;
    }
  }
  console.log(`\nDone: ${ok} success, ${fail} failed`);
})();
