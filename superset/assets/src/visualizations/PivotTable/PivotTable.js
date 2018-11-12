import dt from 'datatables.net-bs';
import 'datatables.net-bs/css/dataTables.bootstrap.css';
import $ from 'jquery';
import PropTypes from 'prop-types';
import { d3format, fixDataTableBodyHeight } from '../../modules/utils';
import './PivotTable.css';

dt(window, $);

const propTypes = {
  data: PropTypes.shape({
    // TODO: replace this with raw data in SIP-6
    html: PropTypes.string,
    columns: PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ])),
  }),
  height: PropTypes.number,
  columnFormats: PropTypes.objectOf(PropTypes.string),
  numberFormat: PropTypes.string,
  numGroups: PropTypes.number,
  verboseMap: PropTypes.objectOf(PropTypes.string),
};

function PivotTable(element, props) {
  const {
    data,
    height,
    alignPositiveNegative = alignPn,
    colorPositiveNegative = colorPn,
    includeSearch,
    metrics,
    orderDesc,
    pageLength,
    tableFilter,
    tableTimestampFormat,
    columnFormats,
    numberFormat,
    numGroups,
    verboseMap,
    timeseriesLimitMetric,
  } = props;

  const { html, columns } = data;
  const container = element;
  const $container = $(element);

  // payload data is a string of html with a single table element
  container.innerHTML = html;

  const cols = Array.isArray(columns[0])
    ? columns.map(col => col[0])
    : columns;

  // jQuery hack to set verbose names in headers
  const replaceCell = function () {
    const s = $(this)[0].textContent;
    $(this)[0].textContent = verboseMap[s] || s;
  };
  $container.find('thead tr:first th').each(replaceCell);
  $container.find('thead tr th:first-child').each(replaceCell);

  // jQuery hack to format number
  $container.find('tbody tr').each(function () {
    $(this).find('td').each(function (i) {
      const metric = cols[i];
      const format = columnFormats[metric] || numberFormat || '.3s';
      const tdText = $(this)[0].textContent;
      // 只对数字格式化
      if (!isNaN(tdText) && !isNaN(parseInt(tdText))) {
        $(this)[0].textContent = d3format(format, tdText);
        $(this).attr('data-sort', tdText);
      }
    });
  });

  // we use the DataTable plugin to make the header fixed.
  // The plugin takes care of the scrolling so we don't need
  // overflow: 'auto' on the table.
  container.style.overflow = 'hidden';

  const paging = pageLength && pageLength > 0;

  const table = $container.find('table').DataTable({
    paging,
    pageLength,
    aaSorting: [],
    searching: includeSearch,
    bInfo: false,
    scrollY: `${height}px`,
    scrollCollapse: true,
    scrollX: true,
  });
  fixDataTableBodyHeight($container.find('.dataTables_wrapper'), height);

  // 已增加数据库排序，此处注释；等timeseriesLimitMetric传输成功后，再根据是否为空判断是否前端排序（如空则按首列排序）
  // Sorting table by main column
  let sortBy;
  const limitMetric = Array.isArray(timeseriesLimitMetric)
    ? timeseriesLimitMetric[0]
    : timeseriesLimitMetric;
  if (limitMetric) {
    // Sort by as specified
    sortBy = limitMetric.label || limitMetric;
  } else if (metrics.length > 0) {
    // If not specified, use the first metric from the list
    sortBy = metrics[0];
  }
  if (sortBy) {
    const keys = columns.map(c => c.key);
    const index = keys.indexOf(sortBy);
    table.column(index).order(orderDesc ? 'desc' : 'asc');
    if (metrics.map(m => m.label || m).indexOf(sortBy) < 0) { //防止文字排序列被意外删除
      // Hiding the sortBy column if not in the metrics list
      table.column(index).visible(false);
    }
  }
  table.draw();
}

PivotTable.displayName = 'PivotTable';
PivotTable.propTypes = propTypes;

export default PivotTable;
