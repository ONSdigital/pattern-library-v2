let callbacks = [];

const onReady = () => {
  callbacks.forEach(fn => fn.call());
  callbacks = [];
  window.onsDOMReady = true;
};

export default function ready(fn) {
  if (document.readyState === 'loading') {
    callbacks.push(fn);
  } else {
    fn.call();
  }
}

document.addEventListener('DOMContentLoaded', onReady);
