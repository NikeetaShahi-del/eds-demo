import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { dirname, join, relative } from 'path';

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

const PACKAGE_NAME = 'eds-demo-content';
const PACKAGE_GROUP = 'eds-demo';
const PACKAGE_VERSION = '1.0.0';
const CONTENT_ROOT = '/content/eds-demo';

const files = findFiles('content', '.plain.html')
  .filter(f => !f.endsWith('nav.plain.html') && !f.endsWith('footer.plain.html'));

const outputBase = 'package-build';

// META-INF/vault
mkdirSync(join(outputBase, 'META-INF/vault'), { recursive: true });

writeFileSync(join(outputBase, 'META-INF/vault/properties.xml'),
`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">
<properties>
  <entry key="name">${PACKAGE_NAME}</entry>
  <entry key="group">${PACKAGE_GROUP}</entry>
  <entry key="version">${PACKAGE_VERSION}</entry>
  <entry key="description">EDS Demo content - 61 pages across 11 locales</entry>
  <entry key="createdBy">excat-migration</entry>
  <entry key="packageType">content</entry>
</properties>
`);

const pageNodes = [];
files.forEach(file => {
  const relPath = relative('content', file)
    .replace('.plain.html', '')
    .replace(/\\/g, '/');
  pageNodes.push({ file, relPath, jcrPath: CONTENT_ROOT + '/' + relPath });
});

// filter.xml - single root filter
writeFileSync(join(outputBase, 'META-INF/vault/filter.xml'),
`<?xml version="1.0" encoding="UTF-8"?>
<workspaceFilter version="1.0">
  <filter root="${CONTENT_ROOT}">
    <include pattern="${CONTENT_ROOT}(/.*)?"/>
  </filter>
</workspaceFilter>
`);

writeFileSync(join(outputBase, 'META-INF/vault/config.xml'),
`<?xml version="1.0" encoding="UTF-8"?>
<vaultfs version="1.1">
  <aggregates/>
  <handlers/>
</vaultfs>
`);

function extractTitle(html) {
  const m = html.match(/<h1[^>]*>([^<]+)<\/h1>/)
    || html.match(/<div>Title<\/div><div>([^<]+)<\/div>/);
  return m ? m[1].trim() : '';
}

function extractDescription(html) {
  const m = html.match(/<div>Description<\/div><div>([^<]+)<\/div>/);
  return m ? m[1].trim() : '';
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

const createdDirs = new Set();

function ensureParentNodes(jcrPath) {
  const parts = jcrPath.split('/').filter(Boolean);
  for (let i = 2; i < parts.length; i++) {
    const folderPath = '/' + parts.slice(0, i + 1).join('/');
    if (createdDirs.has(folderPath)) continue;
    createdDirs.add(folderPath);
    const isPage = pageNodes.some(p => p.jcrPath === folderPath);
    if (!isPage) {
      const fsPath = join(outputBase, 'jcr_root', folderPath, '.content.xml');
      mkdirSync(dirname(fsPath), { recursive: true });
      writeFileSync(fsPath,
`<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:jcr="http://www.jcp.org/jcr/1.0"
    xmlns:sling="http://sling.apache.org/jcr/sling/1.0"
    jcr:primaryType="sling:Folder"/>
`);
    }
  }
}

// Create the eds-demo root node
const rootDir = join(outputBase, 'jcr_root/content/eds-demo');
mkdirSync(rootDir, { recursive: true });
writeFileSync(join(rootDir, '.content.xml'),
`<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:jcr="http://www.jcp.org/jcr/1.0"
    xmlns:sling="http://sling.apache.org/jcr/sling/1.0"
    jcr:primaryType="sling:OrderedFolder"
    jcr:title="EDS Demo"/>
`);
createdDirs.add('/content/eds-demo');

let created = 0;
pageNodes.forEach(({ file, relPath, jcrPath }) => {
  const html = readFileSync(file, 'utf-8');
  const title = extractTitle(html) || relPath.split('/').pop().replace(/-/g, ' ');
  const description = extractDescription(html);

  ensureParentNodes(jcrPath);

  const pageDir = join(outputBase, 'jcr_root', jcrPath);
  mkdirSync(pageDir, { recursive: true });

  writeFileSync(join(pageDir, '.content.xml'),
`<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:jcr="http://www.jcp.org/jcr/1.0"
    xmlns:cq="http://www.day.com/jcr/cq/1.0"
    xmlns:sling="http://sling.apache.org/jcr/sling/1.0"
    jcr:primaryType="cq:Page">
  <jcr:content
      jcr:primaryType="cq:PageContent"
      jcr:title="${esc(title)}"
      jcr:description="${esc(description)}"
      sling:resourceType="core/franklin/components/page/v1/page"
      cq:lastModified="{Date}2026-04-22T00:00:00.000Z"/>
</jcr:root>
`);
  created++;
});

console.log('Created ' + created + ' page nodes under /content/eds-demo');

// Zip it
const archiver = (await import('archiver')).default;
const fs = await import('fs');
const zipFile = 'eds-demo-content-1.0.0.zip';
const output = fs.createWriteStream(zipFile);
const archive = archiver('zip', { zlib: { level: 9 } });

await new Promise((resolve, reject) => {
  output.on('close', () => {
    console.log('Package: ' + zipFile + ' (' + Math.round(archive.pointer() / 1024) + ' KB)');
    resolve();
  });
  archive.on('error', reject);
  archive.pipe(output);
  archive.directory('package-build/META-INF/', 'META-INF');
  archive.directory('package-build/jcr_root/', 'jcr_root');
  archive.finalize();
});
