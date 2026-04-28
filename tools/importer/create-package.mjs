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

// Create a minimal AEM content package with page stubs
// Pages get their content from the EDS delivery pipeline, 
// but need JCR page nodes to exist in AEM

const PACKAGE_NAME = 'wknd-content';
const PACKAGE_GROUP = 'wknd';
const PACKAGE_VERSION = '1.0.0';
const CONTENT_ROOT = '/content/wknd';

const files = findFiles('content', '.plain.html')
  .filter(f => !f.endsWith('nav.plain.html') && !f.endsWith('footer.plain.html'));

const outputBase = 'package-build';

// Create META-INF/vault
mkdirSync(join(outputBase, 'META-INF/vault'), { recursive: true });

// properties.xml
writeFileSync(join(outputBase, 'META-INF/vault/properties.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">
<properties>
  <entry key="name">${PACKAGE_NAME}</entry>
  <entry key="group">${PACKAGE_GROUP}</entry>
  <entry key="version">${PACKAGE_VERSION}</entry>
  <entry key="description">WKND site content migration - 61 pages across 11 locales</entry>
  <entry key="createdBy">excat-migration</entry>
  <entry key="packageType">content</entry>
</properties>
`);

// Build filter rules from content paths
const filterRules = [];
const pageNodes = [];

files.forEach(file => {
  const relPath = relative('content', file)
    .replace('.plain.html', '')
    .replace(/\\/g, '/');
  const jcrPath = CONTENT_ROOT + '/' + relPath;
  filterRules.push(jcrPath);
  pageNodes.push({ file, relPath, jcrPath });
});

// filter.xml
const filterEntries = filterRules.map(p => 
  `  <filter root="${p}"/>`
).join('\n');

writeFileSync(join(outputBase, 'META-INF/vault/filter.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<workspaceFilter version="1.0">
${filterEntries}
</workspaceFilter>
`);

// config.xml
writeFileSync(join(outputBase, 'META-INF/vault/config.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<vaultfs version="1.1">
  <aggregates/>
  <handlers/>
</vaultfs>
`);

// Create jcr_root content structure
// Each page needs: 
//   jcr_root/content/wknd/{path}/.content.xml (page node)
//   jcr_root/content/wknd/{path}/jcr:content/.content.xml (page content)

function extractTitle(htmlContent) {
  const match = htmlContent.match(/<h1[^>]*>([^<]+)<\/h1>/);
  if (match) return match[1].trim();
  const metaMatch = htmlContent.match(/<div>Title<\/div><div>([^<]+)<\/div>/);
  if (metaMatch) return metaMatch[1].trim();
  return '';
}

function extractDescription(htmlContent) {
  const match = htmlContent.match(/<div>Description<\/div><div>([^<]+)<\/div>/);
  return match ? match[1].trim() : '';
}

// Create intermediate folder nodes
const createdDirs = new Set();

function ensureParentNodes(jcrPath) {
  const parts = jcrPath.split('/').filter(Boolean);
  // Skip first two: content/wknd
  for (let i = 2; i < parts.length; i++) {
    const folderPath = '/' + parts.slice(0, i + 1).join('/');
    if (createdDirs.has(folderPath)) continue;
    createdDirs.add(folderPath);
    
    const fsPath = join(outputBase, 'jcr_root', folderPath, '.content.xml');
    mkdirSync(dirname(fsPath), { recursive: true });
    
    // Check if this folder has a corresponding page
    const isPage = pageNodes.some(p => p.jcrPath === folderPath);
    if (!isPage) {
      writeFileSync(fsPath, `<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:jcr="http://www.jcp.org/jcr/1.0"
    xmlns:nt="http://www.jcp.org/jcr/nt/1.0"
    xmlns:sling="http://sling.apache.org/jcr/sling/1.0"
    jcr:primaryType="sling:Folder"/>
`);
    }
  }
}

let created = 0;
pageNodes.forEach(({ file, relPath, jcrPath }) => {
  const html = readFileSync(file, 'utf-8');
  const title = extractTitle(html) || relPath.split('/').pop().replace(/-/g, ' ');
  const description = extractDescription(html);
  
  ensureParentNodes(jcrPath);
  
  // Page node
  const pageDir = join(outputBase, 'jcr_root', jcrPath);
  mkdirSync(pageDir, { recursive: true });
  
  const escapedTitle = title.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const escapedDesc = description.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  
  writeFileSync(join(pageDir, '.content.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:jcr="http://www.jcp.org/jcr/1.0"
    xmlns:cq="http://www.day.com/jcr/cq/1.0"
    xmlns:nt="http://www.jcp.org/jcr/nt/1.0"
    xmlns:sling="http://sling.apache.org/jcr/sling/1.0"
    jcr:primaryType="cq:Page">
  <jcr:content
      jcr:primaryType="cq:PageContent"
      jcr:title="${escapedTitle}"
      jcr:description="${escapedDesc}"
      sling:resourceType="core/franklin/components/page/v1/page"
      cq:lastModified="{Date}2026-04-22T00:00:00.000Z"
      cq:template="/conf/wknd/settings/wcm/templates/page"/>
</jcr:root>
`);
  
  created++;
});

console.log('Created ' + created + ' page nodes');
console.log('Package structure ready at: ' + outputBase);

// Now zip it
import { execSync } from 'child_process';
const zipFile = 'wknd-content-1.0.0.zip';
try {
  execSync(`cd ${outputBase} && zip -r ../${zipFile} META-INF jcr_root`, { stdio: 'pipe' });
  const stats = statSync(zipFile);
  console.log('Package created: ' + zipFile + ' (' + Math.round(stats.size / 1024) + ' KB)');
} catch (e) {
  console.error('Zip failed:', e.message);
}
