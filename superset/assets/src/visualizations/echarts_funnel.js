import echarts from 'echarts';

function echartsFunnelVis(slice, payload) {
    // 构建存放echarts图表的div，自适应大小
    const div = d3.select(slice.selector);
    const sliceId = 'echarts_slice_' + slice.formData.slice_id;
    const html = '<div id=' + sliceId + ' style="width:' + slice.width() + 'px;height:' + slice.height() + 'px;"></div>';
    div.html(html); // reset
    
    // 配置echarts所需的数据
    // const fd = slice.formData;
    const json = payload.data;
    
    const dataName = [];  // echarts的漏斗图需要的是两个数组
    let maxValue = 0;
    const dataValue = json;
    dataValue.forEach(function (item) {
        dataName.push(item.name);
        if (item.value > maxValue) {
            maxValue = item.value;
        }
    });
    
    // option的开始和结束，直接从echarts官网拷下来
    const option = {
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c}',
        },
        legend: {
            data: dataName,
        },
        calculable: true,
    series: [
        {
            name: '漏斗图',
            type: 'funnel',
            left: '10%',
            top: 60,
            // x2: 80,
            bottom: 60,
            width: '80%',
            // height: {totalHeight} - y - y2,
            min: 0,
            max: maxValue,
            minSize: '0%',
            maxSize: '100%',
            sort: 'descending',
            gap: 2,
            label: {
                normal: {
                    show: true,
                    position: 'inside',
                },
                emphasis: {
                    textStyle: {
                        fontSize: 20,
                    },
                },
            },
            labelLine: {
                normal: {
                    length: 10,
                    lineStyle: {
                        width: 1,
                        type: 'solid',
                    },
                },
            },
            itemStyle: {
                normal: {
                    borderColor: '#fff',
                    borderWidth: 1,
                },
            },
            data: dataValue,
        },
    ],
};

    // 初始化echarts实例，使用刚指定的配置项和数据显示图表
    const myChart = echarts.init(document.getElementById(sliceId));
    myChart.setOption(option);
}

// superset的导出方式
module.exports = echartsFunnelVis;