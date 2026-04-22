import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { dirname, join, relative, basename } from 'path';
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import { toMdast } from 'hast-util-to-mdast';
import { toMarkdown } from 'mdast-util-to-markdown';
import { gfmToMarkdown } from 'mdast-util-gfm';
import { md2jcr } from '@adobe/helix-md2jcr';

const models = JSON.parse(readFileSync('component-models.json', 'utf-8'));
const definition = JSON.parse(readFileSync('component-definition.json', 'utf-8'));
const filters = JSON.parse(readFileSync('component-filters.json', 'utf-8'));

// Remove ALL unsupported node types from mdast tree
function cleanMdast(node) {
  if (node.children) {
    node.children = node.children.filter((child) => {
      // Remove unsupported node types
      if (child.type === 'html') return false;
      if (child.type === 'table') return false;
      return true;
    });
    node.children.forEach(cleanMdast);
  }
  return node;
}

async function convertFile(htmlPath, outputDir) {
  const html = readFileSync(htmlPath, 'utf-8');

  // Parse HTML to HAST, convert to MDAST, clean, then to markdown
  const hast = unified().use(rehypeParse, { fragment: true }).parse(html);
  let mdast = toMdast(hast);
  mdast = cleanMdast(mdast);
  const md = toMarkdown(mdast, { extensions: [gfmToMarkdown()] });

  try {
    const xml = await md2jcr(md, { models, definition, filters });
    const relPath = relative('content', htmlPath)
      .replace('.plain.html', '')
      .replace(/\\/g, '/');
    const xmlDir = join(outputDir, relPath);
    mkdirSync(xmlDir, { recursive: true });
    writeFileSync(join(xmlDir, '.content.xml'), xml);
    console.log('✅ ' + relPath);
    return true;
  } catch (e) {
    console.error('❌ ' + htmlPath + ': ' + e.message);
    return false;
  }
}

function findFiles(dir, pattern) {
  const results = [];
  function walk(d) {
    for (const f of readdirSync(d)) {
      const full = join(d, f);
      if (statSync(full).isDirectory()) walk(full);
      else if (full.endsWith(pattern)) results.push(full);
    }
  }
  walk(dir);
  return results;
}

const files = findFiles('content', '.plain.html')
  .filter((f) => !f.endsWith('nav.plain.html') && !f.endsWith('footer.plain.html'));
const outputDir = 'jcr_root/content/wknd';

console.log('Converting ' + files.length + ' files to JCR XML...');

let success = 0;
let failed = 0;
for (const file of files) {
  const ok = await convertFile(file, outputDir);
  if (ok) success++;
  else failed++;
}

console.log('\nDone: ' + success + ' success, ' + failed + ' failed');
