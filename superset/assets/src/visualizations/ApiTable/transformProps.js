export default function transformProps(chartProps) {
    const { height, datasource, formData, payload } = chartProps;
    const {
      numberFormat,
      externalApiService,
      externalApiParam,
    } = formData;
    const {
      columnFormats,
      verboseMap,
    } = datasource;
  
    const Services = {
      "rpc": "/sachima/v1/rpc/",
      "grpc": "/sachima/v1/grpc/",
      "restful": "/sachima/v1/restful/",
    }

    return {
      height,
      data: payload.data,
      externalApiService: Services[externalApiService],
      externalApiParam,
      columnFormats,
      numberFormat,
      verboseMap,
    };
  }
  