import frontMatter from 'front-matter';
import fs from 'fs';
import glob from 'glob';
import path from 'path';

let pageListingCache = null;
let siteMapCache = null;

function buildPageListing() {
  return glob.sync('./src/**/[^_]*.njk').map(templatePath => {
    templatePath = path.resolve(templatePath);
    const data = frontMatter(fs.readFileSync(templatePath, { encoding: 'utf8' }));

    let segment = templatePath.match(/([^\/]+).njk/)[1];
    if (segment === 'index') {
      segment = templatePath.match(/([^\/]+)\/index.njk/)[1];
    }

    return {
      ...data.attributes,
      templatePath,
      url: templatePath
        .substr(5)
        .replace(/\\/g, '/')
        .replace(/.+\/src\//, '/')
        .replace(/^\/pages\//, '/')
        .replace('index.njk', '')
        .replace('.njk', ''),
      title: data.attributes.title || segment,
      sortOrder: data.attributes.sortOrder || Infinity,
      group: data.attributes.group || '',
      lang: data.attributes.lang || '',
      experimental: data.attributes.experimental || '',
    };
  });
}

export function getPageListing() {
  if (pageListingCache === null || process.env.IS_DEV_SERVER) {
    pageListingCache = buildPageListing();
  }
  return pageListingCache;
}

function buildSiteMap() {
  const pages = getPageListing();

  let siteMap = {
    children: [],
    lookup: new Map(),
  };

  for (let page of pages) {
    let entry = siteMap;

    const segments = page.url.replace(/^\/|\/$/g, '').split('/');
    for (let i = 0; i < segments.length; ++i) {
      let targetEntry = entry.children.find(child => child.segment === segments[i]);
      if (!targetEntry) {
        targetEntry = { segment: segments[i], depth: i, parent: entry, children: [] };
        entry.children.push(targetEntry);
      }

      entry = targetEntry;

      if (i === segments.length - 1) {
        Object.assign(entry, page);
        siteMap.lookup.set(page.templatePath, entry);
      }
    }
  }
  // console.log(JSON.stringify(siteMap, true, 4));process.abort();
  return siteMap;
}

export function getSiteMap() {
  if (siteMapCache === null || process.env.IS_DEV_SERVER) {
    siteMapCache = buildSiteMap();
  }
  return siteMapCache;
}

export function getPageInfo(templatePath) {
  templatePath = path.resolve(templatePath);
  const siteMap = getSiteMap();
  const entry = siteMap.lookup.get(path.resolve(templatePath));
  return { ...entry, siteMap: siteMap.children };
}
