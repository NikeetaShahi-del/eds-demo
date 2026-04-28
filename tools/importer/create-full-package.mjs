import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, cpSync, existsSync } from 'fs';
import { dirname, join, relative } from 'path';

const SRC_JCR = 'jcr_root/content/wknd';
const DST_ROOT = 'package-build-full';
const DST_JCR = join(DST_ROOT, 'jcr_root/content/eds-demo');

// Create META-INF
mkdirSync(join(DST_ROOT, 'META-INF/vault'), { recursive: true });

writeFileSync(join(DST_ROOT, 'META-INF/vault/properties.xml'),
`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE properties SYSTEM "http://java.sun.com/dtd/properties.dtd">
<properties>
  <entry key="name">eds-demo-content-full</entry>
  <entry key="group">eds-demo</entry>
  <entry key="version">2.0.0</entry>
  <entry key="description">EDS Demo full content - 55 pages with JCR content tree</entry>
  <entry key="createdBy">excat-migration</entry>
  <entry key="packageType">content</entry>
</properties>
`);

writeFileSync(join(DST_ROOT, 'META-INF/vault/filter.xml'),
`<?xml version="1.0" encoding="UTF-8"?>
<workspaceFilter version="1.0">
  <filter root="/content/eds-demo" mode="merge"/>
</workspaceFilter>
`);

writeFileSync(join(DST_ROOT, 'META-INF/vault/config.xml'),
`<?xml version="1.0" encoding="UTF-8"?>
<vaultfs version="1.1">
  <aggregates/>
  <handlers/>
</vaultfs>
`);

// Copy the full JCR content from /content/wknd to /content/eds-demo
function copyDir(src, dst) {
  if (!existsSync(src)) return 0;
  mkdirSync(dst, { recursive: true });
  let count = 0;
  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry);
    const dstPath = join(dst, entry);
    if (statSync(srcPath).isDirectory()) {
      count += copyDir(srcPath, dstPath);
    } else {
      let content = readFileSync(srcPath, 'utf-8');
      // No path replacements needed - JCR XML is path-independent
      writeFileSync(dstPath, content);
      if (entry === '.content.xml') count++;
    }
  }
  return count;
}

const xmlCount = copyDir(SRC_JCR, DST_JCR);
console.log(`Copied ${xmlCount} .content.xml files to /content/eds-demo`);

// Create the eds-demo root node if not already present
const rootXml = join(DST_JCR, '.content.xml');
if (!existsSync(rootXml)) {
  writeFileSync(rootXml,
`<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:jcr="http://www.jcp.org/jcr/1.0"
    xmlns:sling="http://sling.apache.org/jcr/sling/1.0"
    jcr:primaryType="sling:OrderedFolder"
    jcr:title="EDS Demo"/>
`);
}

// Zip
const archiver = (await import('archiver')).default;
const fs = await import('fs');
const zipFile = 'eds-demo-content-full-2.0.0.zip';
const output = fs.createWriteStream(zipFile);
const archive = archiver('zip', { zlib: { level: 9 } });

await new Promise((resolve, reject) => {
  output.on('close', () => {
    console.log(`Package: ${zipFile} (${Math.round(archive.pointer() / 1024)} KB)`);
    resolve();
  });
  archive.on('error', reject);
  archive.pipe(output);
  archive.directory(join(DST_ROOT, 'META-INF/'), 'META-INF');
  archive.directory(join(DST_ROOT, 'jcr_root/'), 'jcr_root');
  archive.finalize();
});
