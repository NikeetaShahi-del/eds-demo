import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import { toMdast } from 'hast-util-to-mdast';
import { toMarkdown } from 'mdast-util-to-markdown';
import { gfmToMarkdown } from 'mdast-util-gfm';
import { md2jcr } from '@adobe/helix-md2jcr';

const models = JSON.parse(readFileSync('component-models.json', 'utf-8'));
const definition = JSON.parse(readFileSync('component-definition.json', 'utf-8'));
const filters = JSON.parse(readFileSync('component-filters.json', 'utf-8'));

// Strip all unsupported node types from mdast
function cleanMdast(node) {
  if (!node.children) return node;
  node.children = node.children.filter((child) => {
    if (child.type === 'html') return false; // Remove all raw HTML
    if (child.type === 'table') return false; // Remove GFM tables
    return true;
  });
  node.children.forEach(cleanMdast);
  return node;
}

const failedFiles = [
  'content/us/en.plain.html',
  'content/us/en/magazine.plain.html',
  'content/us/en/adventures.plain.html',
  'content/ca/en.plain.html',
  'content/ca/en/magazine.plain.html',
  'content/ca/en/adventures.plain.html',
];

const outputBase = 'jcr_root/content/wknd';
let success = 0;

for (const file of failedFiles) {
  const html = readFileSync(file, 'utf-8');
  const hast = unified().use(rehypeParse, { fragment: true }).parse(html);
  let mdast = toMdast(hast);
  mdast = cleanMdast(mdast);
  const md = toMarkdown(mdast, { extensions: [gfmToMarkdown()] });

  const relPath = file
    .replace('content/', '')
    .replace('.plain.html', '');

  try {
    const xml = await md2jcr(md, { models, definition, filters });
    const xmlDir = join(outputBase, relPath);
    mkdirSync(xmlDir, { recursive: true });
    writeFileSync(join(xmlDir, '.content.xml'), xml);
    console.log('✅ ' + relPath);
    success++;
  } catch (e) {
    console.error('❌ ' + relPath + ': ' + e.message);
  }
}

console.log('\nFixed: ' + success + '/' + failedFiles.length);
