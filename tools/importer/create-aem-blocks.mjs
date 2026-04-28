/**
 * Creates proper block JCR nodes in AEM via Sling POST API.
 * Reads .plain.html content files and creates corresponding
 * block component nodes in AEM JCR.
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { JSDOM } from 'jsdom';

const AEM_HOST = process.env.AEM_HOST || 'https://author-p11300-e47725.adobeaemcloud.com';
const TOKEN = process.env.AEM_TOKEN;
const CONTENT_ROOT = '/content/eds-demo';

if (!TOKEN) {
  console.error('Set AEM_TOKEN environment variable');
  process.exit(1);
}

async function post(path, data) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(data)) {
    params.append(k, v);
  }
  const resp = await fetch(`${AEM_HOST}${path}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}` },
    body: params,
  });
  return resp.status;
}

async function deleteNode(path) {
  return post(path, { ':operation': 'delete' });
}

async function createNode(path, props) {
  return post(path, { 'jcr:primaryType': 'nt:unstructured', ...props });
}

// Parse .plain.html and extract block structure
function parseContent(htmlPath) {
  const html = readFileSync(htmlPath, 'utf-8');
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const blocks = [];
  const defaultContent = [];

  // Process top-level elements
  const container = doc.querySelector('body > div') || doc.body;
  for (const el of container.children) {
    if (el.classList.length > 0 && el.tagName === 'DIV') {
      const blockName = el.classList[0];
      if (blockName === 'metadata') continue;
      blocks.push({ name: blockName, element: el });
    } else if (el.tagName === 'H1') {
      defaultContent.push({ type: 'title', tag: 'h1', text: el.textContent.trim() });
    } else if (el.tagName === 'H2') {
      defaultContent.push({ type: 'title', tag: 'h2', text: el.textContent.trim() });
    } else if (el.tagName === 'H3') {
      defaultContent.push({ type: 'title', tag: 'h3', text: el.textContent.trim() });
    } else if (el.tagName === 'P' && el.querySelector('img')) {
      const img = el.querySelector('img');
      defaultContent.push({
        type: 'image',
        src: img.src || img.getAttribute('src') || '',
        alt: img.alt || '',
      });
    } else if (el.tagName === 'P') {
      defaultContent.push({ type: 'text', html: el.outerHTML });
    } else if (el.tagName === 'UL' || el.tagName === 'OL') {
      defaultContent.push({ type: 'text', html: el.outerHTML });
    }
  }

  return { blocks, defaultContent };
}

// Extract accordion items from block element
function extractAccordionItems(el) {
  const items = [];
  for (const row of el.children) {
    if (row.tagName !== 'DIV') continue;
    const cells = row.querySelectorAll(':scope > div');
    if (cells.length >= 2) {
      const summary = cells[0].textContent.trim();
      const text = cells[1].innerHTML;
      items.push({ summary, text });
    }
  }
  return items;
}

// Extract tabs items from block element
function extractTabsItems(el) {
  const items = [];
  for (const row of el.children) {
    if (row.tagName !== 'DIV') continue;
    const cells = row.querySelectorAll(':scope > div');
    if (cells.length >= 2) {
      const title = cells[0].textContent.trim();
      const contentEl = cells[1];
      const heading = contentEl.querySelector('h3, h4, h5, h6');
      const img = contentEl.querySelector('img');
      const richtext = [];
      for (const child of contentEl.children) {
        if (child === heading) continue;
        if (child.tagName === 'P' && child.querySelector('img')) continue;
        richtext.push(child.outerHTML);
      }
      items.push({
        title,
        content_heading: heading ? heading.textContent.trim() : title,
        content_headingType: heading ? heading.tagName.toLowerCase() : 'h3',
        content_image: img ? (img.src || img.getAttribute('src') || '') : '',
        content_richtext: richtext.join(''),
      });
    }
  }
  return items;
}

// Extract carousel items
function extractCarouselItems(el) {
  const items = [];
  for (const row of el.children) {
    if (row.tagName !== 'DIV') continue;
    const cells = row.querySelectorAll(':scope > div');
    if (cells.length >= 1) {
      const img = cells[0].querySelector('img');
      const text = cells.length >= 2 ? cells[1].innerHTML : '';
      items.push({
        media_image: img ? (img.src || img.getAttribute('src') || '') : '',
        media_imageAlt: img ? (img.alt || '') : '',
        content_text: text,
      });
    }
  }
  return items;
}

// Extract cards items
function extractCardsItems(el) {
  const items = [];
  for (const row of el.children) {
    if (row.tagName !== 'DIV') continue;
    const cells = row.querySelectorAll(':scope > div');
    if (cells.length >= 2) {
      const img = cells[0].querySelector('img');
      items.push({
        image: img ? (img.src || img.getAttribute('src') || '') : '',
        imageAlt: img ? (img.alt || '') : '',
        text: cells[1].innerHTML,
      });
    }
  }
  return items;
}

// Extract hero (simple block) fields
function extractHeroFields(el) {
  const rows = el.querySelectorAll(':scope > div');
  let image = '', imageAlt = '', text = '';
  if (rows.length >= 1) {
    const img = rows[0].querySelector('img');
    if (img) {
      image = img.src || img.getAttribute('src') || '';
      imageAlt = img.alt || '';
    }
  }
  if (rows.length >= 2) {
    text = rows[1].innerHTML;
  }
  return { image, imageAlt, text };
}

async function createPageBlocks(pagePath, htmlPath) {
  const { blocks, defaultContent } = parseContent(htmlPath);
  const sectionPath = `${pagePath}/jcr:content/root/section`;

  // Delete existing section
  await deleteNode(sectionPath);

  // Create fresh section
  await createNode(sectionPath, {
    'sling:resourceType': 'core/franklin/components/section/v1/section',
    'model': 'section',
  });

  let nodeIdx = 0;

  // Create default content nodes first
  for (const dc of defaultContent) {
    const nodeName = `${dc.type}_${nodeIdx++}`;
    if (dc.type === 'title') {
      await createNode(`${sectionPath}/${nodeName}`, {
        'sling:resourceType': 'core/franklin/components/title/v1/title',
        'jcr:title': dc.text,
        'titleType': dc.tag,
      });
    } else if (dc.type === 'image') {
      await createNode(`${sectionPath}/${nodeName}`, {
        'sling:resourceType': 'core/franklin/components/image/v1/image',
        'image': dc.src,
        'imageAlt': dc.alt,
      });
    } else if (dc.type === 'text') {
      await createNode(`${sectionPath}/${nodeName}`, {
        'sling:resourceType': 'core/franklin/components/text/v1/text',
        'text': dc.html,
      });
    }
  }

  // Create block nodes
  for (const block of blocks) {
    const blockNodeName = `block_${nodeIdx++}`;
    const blockPath = `${sectionPath}/${blockNodeName}`;

    if (block.name === 'accordion') {
      await createNode(blockPath, {
        'sling:resourceType': 'core/franklin/components/block/v1/block',
        'name': 'Accordion',
        'filter': 'accordion',
      });
      const items = extractAccordionItems(block.element);
      for (let i = 0; i < items.length; i++) {
        await createNode(`${blockPath}/item_${i}`, {
          'sling:resourceType': 'core/franklin/components/block/v1/block/item',
          'name': 'Accordion Item',
          'model': 'accordion-item',
          'summary': items[i].summary,
          'text': items[i].text,
        });
      }
    } else if (block.name === 'tabs') {
      await createNode(blockPath, {
        'sling:resourceType': 'core/franklin/components/block/v1/block',
        'name': 'Tabs',
        'filter': 'tabs',
      });
      const items = extractTabsItems(block.element);
      for (let i = 0; i < items.length; i++) {
        await createNode(`${blockPath}/item_${i}`, {
          'sling:resourceType': 'core/franklin/components/block/v1/block/item',
          'name': 'Tab',
          'model': 'tabs-item',
          'title': items[i].title,
          'content_heading': items[i].content_heading,
          'content_headingType': items[i].content_headingType,
          'content_image': items[i].content_image,
          'content_richtext': items[i].content_richtext,
        });
      }
    } else if (block.name === 'carousel-hero') {
      await createNode(blockPath, {
        'sling:resourceType': 'core/franklin/components/block/v1/block',
        'name': 'Carousel Hero',
        'filter': 'carousel-hero',
      });
      const items = extractCarouselItems(block.element);
      for (let i = 0; i < items.length; i++) {
        await createNode(`${blockPath}/item_${i}`, {
          'sling:resourceType': 'core/franklin/components/block/v1/block/item',
          'name': 'Carousel Hero Slide',
          'model': 'carousel-hero-item',
          ...items[i],
        });
      }
    } else if (block.name === 'carousel') {
      await createNode(blockPath, {
        'sling:resourceType': 'core/franklin/components/block/v1/block',
        'name': 'Carousel',
        'filter': 'carousel',
      });
      const items = extractCarouselItems(block.element);
      for (let i = 0; i < items.length; i++) {
        await createNode(`${blockPath}/item_${i}`, {
          'sling:resourceType': 'core/franklin/components/block/v1/block/item',
          'name': 'Carousel Slide',
          'model': 'carousel-item',
          ...items[i],
        });
      }
    } else if (block.name === 'cards-article') {
      await createNode(blockPath, {
        'sling:resourceType': 'core/franklin/components/block/v1/block',
        'name': 'Cards Article',
        'filter': 'cards-article',
      });
      const items = extractCardsItems(block.element);
      for (let i = 0; i < items.length; i++) {
        await createNode(`${blockPath}/item_${i}`, {
          'sling:resourceType': 'core/franklin/components/block/v1/block/item',
          'name': 'Card',
          'model': 'card',
          ...items[i],
        });
      }
    } else if (block.name === 'hero-featured') {
      const fields = extractHeroFields(block.element);
      await createNode(blockPath, {
        'sling:resourceType': 'core/franklin/components/block/v1/block',
        'name': 'Hero Featured',
        'model': 'hero-featured',
        ...fields,
      });
    } else if (block.name === 'hero-adventure') {
      const fields = extractHeroFields(block.element);
      await createNode(blockPath, {
        'sling:resourceType': 'core/franklin/components/block/v1/block',
        'name': 'Hero Adventure',
        'model': 'hero-adventure',
        ...fields,
      });
    } else if (block.name === 'hero') {
      const fields = extractHeroFields(block.element);
      await createNode(blockPath, {
        'sling:resourceType': 'core/franklin/components/block/v1/block',
        'name': 'Hero',
        'model': 'hero',
        ...fields,
      });
    } else {
      // Generic block - create as simple block
      await createNode(blockPath, {
        'sling:resourceType': 'core/franklin/components/block/v1/block',
        'name': block.name.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' '),
      });
    }
  }

  return { blocks: blocks.length, defaultContent: defaultContent.length };
}

// Find all content files
function findFiles(dir, pattern) {
  const results = [];
  for (const f of readdirSync(dir)) {
    const full = join(dir, f);
    if (statSync(full).isDirectory()) results.push(...findFiles(full, pattern));
    else if (full.endsWith(pattern)) results.push(full);
  }
  return results;
}

const files = findFiles('content', '.plain.html')
  .filter(f => !f.endsWith('nav.plain.html') && !f.endsWith('footer.plain.html') && !f.endsWith('placeholders.json'));

console.log(`Processing ${files.length} pages...`);

let success = 0;
let failed = 0;

for (const file of files) {
  const relPath = relative('content', file).replace('.plain.html', '').replace(/\\/g, '/');
  const pagePath = `${CONTENT_ROOT}/${relPath}`;

  try {
    const result = await createPageBlocks(pagePath, file);
    console.log(`✅ ${relPath} (${result.defaultContent} default + ${result.blocks} blocks)`);
    success++;
  } catch (e) {
    console.error(`❌ ${relPath}: ${e.message}`);
    failed++;
  }
}

console.log(`\nDone: ${success} success, ${failed} failed`);
