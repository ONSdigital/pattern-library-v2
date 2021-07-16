import domready from '../../js/domready';

export const classTableScrollable = 'table-scrollable';

async function tableScroller() {
  const tables = [...document.querySelectorAll(`.${classTableScrollable}`)];

  if (tables.length) {
    const TableScroll = (await import('./scrollable-table')).default;

    tables.forEach(table => new TableScroll(table));
  }
}

domready(tableScroller);
