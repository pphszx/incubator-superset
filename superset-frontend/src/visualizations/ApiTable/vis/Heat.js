import React, { useEffect } from 'react'
import * as echarts from 'echarts'

const Heat = props => {
    useEffect(() => {

        var mychart = echarts.init(document.getElementById('heat'))
        const columns = props.columns.map(col => col.dataIndex)
        const columns_without_index = columns.slice(1)// remove index columns
        var ydata = columns_without_index;
        var xdata = columns_without_index;
        let data = []

        props.data.forEach((dt, x) => {
            columns_without_index.forEach((c, y) => {
                data.push([x, y, dt[c]])
            }
            )
        })

        let option = {
            tooltip: {
                position: 'top'
            },
            toolbox: {
                feature: {
                    dataZoom: {
                        yAxisIndex: 'none'
                    },
                    restore: {},
                    saveAsImage: {
                        backgroundColor: '#393862'
                    }
                }
            },
            animation: false,
            grid: {
                height: '80%',
                left: '13%',
                top: '5%',
                //backgroundColor:'white'
            },
            xAxis: {
                name: 'x',
                nameTextStyle: {
                    // padding: [0, 0, -60, -245],    //the position of text 
                    color: 'white'
                },
                type: 'category',
                data: xdata,
                // textStyle: {
                //     color: 'white'
                // },
                axisLine: {
                    lineStyle: {
                        color: '#fff'
                    }
                },
                splitArea: {         // background split area if no data you can see it
                    show: true,
                    color: 'white'
                },
                axisLabel: {
                    interval: 0,
                    rotate: 50
                }

            },
            yAxis: {
                name: 'y',
                nameTextStyle: {
                    // padding: [0, 0, -210, -80], //the position of text
                    color: 'white'
                },
                type: 'category',
                data: ydata,
                axisLine: {
                    lineStyle: {
                        color: '#fff'
                    }
                },
                axisLabel: {
                    interval: 0,
                }
                // splitArea: {
                //     show: false
                // }
            },
            visualMap: {
                min: -1,
                max: 1,
                // align: 'left',
                textStyle: { color: 'white' },
                calculable: true,
                orient: 'vertical',
                left: '90%',
                top: '35%',
                // top: 'auto',    
                //right: '10%',
                inRange: {
                    // color: ['#fff', '#330033']
                    // color: ['navy','white' ,'salmon']
                    color: props.params && props.params.inrange_color ? props.params.inrange_color : ['navy', 'white', 'salmon']
                }
            },
            series: [{
                name: columns[0],
                type: 'heatmap',
                data: data,
                label: {
                    show: false,
                    color: 'white'
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: 'white'
                    },
                }
            }]
        };
        mychart.setOption(option)
    }, [props])

    return <div id="heat" style={{ width: '100%', height: 1000, backgroundColor: '#393862' }}></div>
}

export default Heat