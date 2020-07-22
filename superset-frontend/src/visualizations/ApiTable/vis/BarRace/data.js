const data = ['apple', '中文', 'orange','shanghai','beijing','hangzhou','深圳'].reduce((res, item) => ({...res, ...{[item]: Array(20).fill(0).map(_ => Math.floor(20 * Math.random()))}}), {});

export default data;