const { readFileSync, readdirSync, statSync } = require('fs');
const { join, relative } = require('path');
const { JSDOM } = require('jsdom');

const AEM_HOST = process.env.AEM_HOST || 'https://author-p11300-e47725.adobeaemcloud.com';
const TOKEN = process.env.AEM_TOKEN;
const CONTENT_ROOT = '/content/eds-demo';
const DAM_MAP = JSON.parse(process.env.DAM_MAP || '{}');
const SKIP_BEFORE = process.env.SKIP_BEFORE || '';

if (!TOKEN) { console.error('Set AEM_TOKEN'); process.exit(1); }

async function post(path, data) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(data)) params.append(k, v);
  const r = await fetch(`${AEM_HOST}${path}`, {
    method: 'POST', headers: { 'Authorization': `Bearer ${TOKEN}` }, body: params,
  });
  return r.status;
}

function normalize(s) { return s.toLowerCase().replace(/[-_]/g, '').replace(/\.[^.]+$/, ''); }

function findDAM(url) {
  if (!url || !url.startsWith('http')) return url;
  const parts = url.split('/');
  for (let i = parts.length - 1; i >= Math.max(0, parts.length - 3); i--) {
    const n = normalize(parts[i].split('?')[0]);
    if (n && DAM_MAP[n]) return DAM_MAP[n];
    for (const [k, v] of Object.entries(DAM_MAP)) {
      if (k.includes(n) || n.includes(k)) return v;
    }
  }
  return null;
}

async function createPage(pagePath, htmlPath) {
  const html = readFileSync(htmlPath, 'utf-8');
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const container = doc.querySelector('body > div') || doc.body;
  const sp = `${pagePath}/jcr:content/root/section`;

  await post(sp, { ':operation': 'delete' });
  await post(sp, {
    'jcr:primaryType': 'nt:unstructured',
    'sling:resourceType': 'core/franklin/components/section/v1/section',
    'model': 'section',
  });

  let idx = 0;
  for (const el of container.children) {
    const name = `c_${idx++}`;

    if (el.classList.length > 0 && el.tagName === 'DIV') {
      const bn = el.classList[0];
      if (bn === 'metadata') continue;

      // For blocks: create the block container + items with fileReference
      if (['accordion','tabs','carousel-hero','carousel','cards-article','hero-featured','hero-adventure','hero'].includes(bn)) {
        const blockNames = {
          'accordion': 'Accordion', 'tabs': 'Tabs',
          'carousel-hero': 'Carousel Hero', 'carousel': 'Carousel',
          'cards-article': 'Cards Article',
          'hero-featured': 'Hero Featured', 'hero-adventure': 'Hero Adventure', 'hero': 'Hero'
        };
        const blockFilters = {
          'accordion': 'accordion', 'tabs': 'tabs',
          'carousel-hero': 'carousel-hero', 'carousel': 'carousel',
          'cards-article': 'cards-article'
        };
        const blockModels = {
          'hero-featured': 'hero-featured', 'hero-adventure': 'hero-adventure', 'hero': 'hero'
        };

        const props = {
          'sling:resourceType': 'core/franklin/components/block/v1/block',
          'name': blockNames[bn] || bn,
        };
        if (blockFilters[bn]) props.filter = blockFilters[bn];
        if (blockModels[bn]) props.model = blockModels[bn];

        // For simple blocks (hero variants), extract image+text
        if (blockModels[bn]) {
          const rows = el.querySelectorAll(':scope > div');
          if (rows.length >= 1) {
            const img = rows[0].querySelector('img');
            if (img) {
              const src = img.getAttribute('src') || '';
              const dam = findDAM(src);
              if (dam) props.fileReference = dam;
              props.imageAlt = img.getAttribute('alt') || '';
            }
          }
          if (rows.length >= 2) props.text = rows[1].innerHTML;
          await post(`${sp}/${name}`, props);
          continue;
        }

        await post(`${sp}/${name}`, props);

        // Create items
        let ii = 0;
        for (const row of el.children) {
          if (row.tagName !== 'DIV') continue;
          const cells = row.querySelectorAll(':scope > div');
          if (cells.length < 1) continue;
          const itemName = `item_${ii++}`;
          const itemProps = {
            'sling:resourceType': 'core/franklin/components/block/v1/block/item',
          };

          if (bn === 'accordion' && cells.length >= 2) {
            itemProps.name = 'Accordion Item';
            itemProps.model = 'accordion-item';
            itemProps.summary = cells[0].textContent.trim();
            itemProps.text = cells[1].innerHTML;
          } else if (bn === 'tabs' && cells.length >= 2) {
            itemProps.name = 'Tab';
            itemProps.model = 'tabs-item';
            itemProps.title = cells[0].textContent.trim();
            const ce = cells[1];
            const h = ce.querySelector('h3,h4,h5,h6');
            const img = ce.querySelector('img');
            itemProps.content_heading = h ? h.textContent.trim() : cells[0].textContent.trim();
            itemProps.content_headingType = h ? h.tagName.toLowerCase() : 'h3';
            if (img) {
              const dam = findDAM(img.getAttribute('src') || '');
              if (dam) itemProps.content_image = dam;
            }
            const rts = [];
            for (const c of ce.children) {
              if (c === h) continue;
              if (c.tagName === 'P' && c.querySelector('img') && c.children.length === 1) continue;
              rts.push(c.outerHTML);
            }
            itemProps.content_richtext = rts.join('');
          } else if ((bn === 'carousel' || bn === 'carousel-hero') && cells.length >= 1) {
            itemProps.name = bn === 'carousel-hero' ? 'Carousel Hero Slide' : 'Carousel Slide';
            itemProps.model = bn === 'carousel-hero' ? 'carousel-hero-item' : 'carousel-item';
            const img = (cells[0] || row).querySelector('img');
            if (img) {
              const dam = findDAM(img.getAttribute('src') || '');
              if (dam) itemProps.fileReference = dam;
              itemProps.media_imageAlt = img.getAttribute('alt') || '';
            }
            itemProps.content_text = cells.length >= 2 ? cells[1].innerHTML : '';
          } else if (bn === 'cards-article' && cells.length >= 2) {
            itemProps.name = 'Card';
            itemProps.model = 'card';
            const img = cells[0].querySelector('img');
            if (img) {
              const dam = findDAM(img.getAttribute('src') || '');
              if (dam) itemProps.fileReference = dam;
              itemProps.imageAlt = img.getAttribute('alt') || '';
            }
            itemProps.text = cells[1].innerHTML;
          }
          await post(`${sp}/${name}/${itemName}`, itemProps);
        }
      } else {
        // Unknown block - just create generic
        await post(`${sp}/${name}`, {
          'sling:resourceType': 'core/franklin/components/block/v1/block',
          'name': bn.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' '),
        });
      }
    } else if (['H1','H2','H3','H4','H5'].includes(el.tagName)) {
      await post(`${sp}/${name}`, {
        'sling:resourceType': 'core/franklin/components/title/v1/title',
        'jcr:title': el.textContent.trim(),
        'titleType': el.tagName.toLowerCase(),
      });
    } else if (el.tagName === 'P' && el.querySelector('img')) {
      const img = el.querySelector('img');
      const src = img.getAttribute('src') || '';
      const dam = findDAM(src);
      const props = {
        'sling:resourceType': 'core/franklin/components/image/v1/image',
        'imageAlt': img.getAttribute('alt') || '',
      };
      if (dam) props.fileReference = dam;
      else props.image = src;
      await post(`${sp}/${name}`, props);
    } else if (['P','UL','OL'].includes(el.tagName)) {
      await post(`${sp}/${name}`, {
        'sling:resourceType': 'core/franklin/components/text/v1/text',
        'text': el.outerHTML,
      });
    }
  }
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
    .filter(f => !f.endsWith('nav.plain.html') && !f.endsWith('footer.plain.html'))
    .sort();

  let skipping = !!SKIP_BEFORE;
  let ok = 0, fail = 0;
  console.log(`Processing ${files.length} pages...`);

  for (const file of files) {
    const relPath = relative('content', file).replace('.plain.html', '').replace(/\\/g, '/');
    if (skipping) {
      if (relPath === SKIP_BEFORE) skipping = false;
      else continue;
    }
    const pagePath = `${CONTENT_ROOT}/${relPath}`;
    try {
      await createPage(pagePath, file);
      console.log(`✅ ${relPath}`);
      ok++;
    } catch (e) {
      console.error(`❌ ${relPath}: ${e.message}`);
      fail++;
    }
  }
  console.log(`\nDone: ${ok} success, ${fail} failed`);
})();
