import domready from '../../js/domready';

export const classTableSortable = 'table--sortable';

async function tableSorter() {
  const tables = [...document.querySelectorAll(`.${classTableSortable}`)];

  if (tables.length) {
    const TableSort = (await import('./sortable-table')).default;

    tables.forEach(table => new TableSort(table));
  }
}

domready(tableSorter);
