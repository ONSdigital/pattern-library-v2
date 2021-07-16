import * as fs from 'fs';
import lodash from 'lodash';

export default function subNavigationHelper({ pageInfo, anchorLinks }) {
  let items = pageInfo.depth === 0 ? pageInfo.children : pageInfo.parent.children;

  items = items.filter(item => !!item.templatePath);

  const groups = [];

  if (anchorLinks) {
    if (fs.existsSync(pageInfo.templatePath)) {
      const item = items.find(item => item.url === pageInfo.url);
      const raw = fs.readFileSync(pageInfo.templatePath, 'utf8');

      const matches = raw
        .match(/\n## ([A-Za-z0-9 ]*)/g)
        .map(match => match.substr(4))
        // ignores headings matching the following strings so they won't be included when building child page anchor sub nav
        .filter(
          match =>
            !match.toLowerCase().includes('research on this') &&
            !match.toLowerCase().includes('help improve this') &&
            !match.toLowerCase().includes('when to use this') &&
            !match.toLowerCase().includes('how to use this') &&
            !match.toLowerCase().includes('variants'),
        );

      const anchors = matches.map(match => ({
        title: match,
        url: `#${match
          .trim()
          .toLowerCase()
          .replace(/\s/g, '-')}`,
      }));

      item.anchors = anchors;
    }
  }

  items.forEach(item => {
    let group = groups.find(g => g.title === item.group);

    if (!group) {
      group = {
        title: item.group,
        items: [],
      };
      groups.push(group);
    }

    group.items.push(item);
  });

  groups.forEach(group => {
    group.items = lodash.orderBy(group.items, ['sortOrder', 'title'], ['asc', 'asc']);
  });

  return groups;
}
