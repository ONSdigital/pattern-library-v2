import domready from '../../js/domready';

const exclusiveWrapperClass = 'js-mutually-exclusive';

async function mutuallyExclusiveInputs() {
  const exclusiveWrapperElements = [...document.getElementsByClassName(exclusiveWrapperClass)];

  if (exclusiveWrapperElements.length) {
    const MutuallyExclusive = (await import('./mutually-exclusive')).default;

    exclusiveWrapperElements.forEach(element => new MutuallyExclusive(element));
  }
}

domready(mutuallyExclusiveInputs);
