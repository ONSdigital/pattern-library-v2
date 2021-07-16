export default function setAttributes(dictionary, attributes) {
  for (const key in attributes) {
    if (attributes.hasOwnProperty(key)) {
      dictionary[key] = attributes[key];
    }
  }

  return dictionary;
}
