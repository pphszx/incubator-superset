export default function transformProps(chartProps) {
  const { height, datasource, formData, queryData } = chartProps;
  const { externalApiService, externalApiParam } = formData;
  const { records, columns } = queryData.data;

  const Services = {
    rpc: '/sachima/v1/rpc/',
    restful: '/sachima/v1/restful/',
  };

  return {
    height,
    data: records,
    externalApiService: Services[externalApiService],
    externalApiParam,
  };
}
