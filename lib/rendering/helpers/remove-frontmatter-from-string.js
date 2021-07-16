export function removeFrontmatterFromString(string) {
  if (string.substring(0, 3) === '---') {
    const matchedDashes = /^---[\r|\n|\r\n]/m.exec(string.slice(3));

    if (matchedDashes) {
      const sliceIndex = matchedDashes.index + matchedDashes[0].length;
      const frontmatter = string.slice(0, sliceIndex + 3);

      return string.slice(frontmatter.length);
    }
  }

  return string;
}
