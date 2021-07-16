import Fuse from 'fuse.js';

export default function queryJson(query, data, searchFields) {
  const options = {
    shouldSort: true,
    threshold: 0.2,
    location: 1,
    distance: 1000,
    keys: [searchFields],
  };

  const fuse = new Fuse(data, options);
  let result = fuse.search(query);
  return result;
}
