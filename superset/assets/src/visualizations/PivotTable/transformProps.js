export default function transformProps(basicChartInput) {
  const { datasource, formData, payload } = basicChartInput;
  const {
    alignPn,
    colorPn,
    includeSearch,
    metrics,
    orderDesc,
    pageLength,
    percentMetrics,
    tableFilter,
    tableTimestampFormat,
    timeseriesLimitMetric,
    groupby,
    numberFormat,
  } = formData;
  const {
    columnFormats,
    verboseMap,
  } = datasource;

  return {
    data: payload.data,
    alignPositiveNegative: alignPn,
    colorPositiveNegative: colorPn,
    includeSearch,
    metrics,
    orderDesc,
    pageLength: pageLength && parseInt(pageLength, 10),
    percentMetrics,
    tableFilter,
    tableTimestampFormat,
    timeseriesLimitMetric,
    columnFormats,
    numGroups: groupby.length,
    numberFormat,
    verboseMap,
  };
}
