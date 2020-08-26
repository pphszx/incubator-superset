import React, { useEffect } from 'react'
import * as echarts from 'echarts'
import echartsGL from 'echarts-gl' // don't remove 

const Scatter3d = props => {
    useEffect(() => {

        const columns = props.columns.map(col => col.dataIndex)

        var mychart = echarts.init(document.getElementById('scatter3d'))
        let data = []
        let row = []
        props.data.forEach((d) => {
            columns.forEach((c) => {
                row.push(d[c])
            })
            data.push(row)
            row = []
        })
        var sizeValue = '57%';
        var symbolSize = 8.5;


        // [[first_graph_x, first_graph_y],...]
        
        let graph2d = [[columns[0], columns[1]], [columns[0], columns[2]], [columns[0], columns[3]], [columns[2], columns[3]]]

        if(props.params){
            graph2d = [props.params.upleft, props.params.upright, props.params.downleft, props.params.downright]
        }

        const getDimType = (name) => {
            if (typeof props.data[1][name] == "string") return 'category'
            return 'value'
        }

        // typeof graph2d[0][0]] ? "string" : 'category'


        let option = {
            tooltip: {},
            grid3D: {
                width: '65%'
            },
            xAxis3D: { name: columns[2] },
            yAxis3D: { name: columns[1] },
            zAxis3D: { name: columns[0] },
            grid: [
                { left: '50%', width: '20%', bottom: sizeValue },
                { left: '75%', width: '20%', bottom: sizeValue },
                { left: '50%', width: '20%', top: sizeValue },
                { left: '75%', width: '20%', top: sizeValue }
            ],
            xAxis: [
                { type: getDimType(graph2d[0][0]), gridIndex: 0, name: graph2d[0][0], axisLabel: { rotate: 50, interval: 0 } },
                { type: getDimType(graph2d[1][0]), gridIndex: 1, name: graph2d[1][0], boundaryGap: false, axisLabel: { rotate: 50, interval: 0 } },
                { type: getDimType(graph2d[2][0]), gridIndex: 2, name: graph2d[2][0], axisLabel: { rotate: 50, interval: 0 } },
                { type: getDimType(graph2d[3][0]), gridIndex: 3, name: graph2d[3][0], axisLabel: { rotate: 50, interval: 0 } }
            ],
            yAxis: [
                { type: getDimType(graph2d[0][1]), gridIndex: 0, name: graph2d[0][1] },
                { type: getDimType(graph2d[1][1]), gridIndex: 1, name: graph2d[1][1] },
                { type: getDimType(graph2d[2][1]), gridIndex: 2, name: graph2d[2][1] },
                { type: getDimType(graph2d[3][1]), gridIndex: 3, name: graph2d[3][1] }
            ],
            dataset: {
                // dimensions: [
                //     'Income',
                //     'Life Expectancy',
                //     'Population',
                //     'Country',
                //     { name: 'Year', type: 'ordinal' }
                // ],
                dimensions: columns,
                source: data
            },
            series: [
                {
                    type: 'scatter3D',
                    symbolSize: 7,
                    encode: {
                        x: columns[2],
                        y: columns[1],
                        z: columns[0],
                        tooltip: [0, 1, 2, 3, 4]
                    }
                },

                {
                    type: 'scatter',
                    symbolSize: symbolSize,
                    xAxisIndex: 0,
                    yAxisIndex: 0,
                    encode: {
                        x: graph2d[0][0],
                        y: graph2d[0][1],
                        tooltip: [0, 1, 2, 3, 4]
                    }
                },
                {
                    type: 'scatter',
                    symbolSize: symbolSize,
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    encode: {
                        x: graph2d[1][0],
                        y: graph2d[1][1],
                        tooltip: [0, 1, 2, 3, 4]
                    }
                },
                {
                    type: 'scatter',
                    symbolSize: symbolSize,
                    xAxisIndex: 2,
                    yAxisIndex: 2,
                    encode: {
                        x: graph2d[2][0],
                        y: graph2d[2][1],
                        tooltip: [0, 1, 2, 3, 4]
                    }
                },
                {
                    type: 'scatter',
                    symbolSize: symbolSize,
                    xAxisIndex: 3,
                    yAxisIndex: 3,
                    encode: {
                        x: graph2d[3][0],
                        y: graph2d[3][1],
                        tooltip: [0, 1, 2, 3, 4]
                    }
                }
            ]
        };
        mychart.setOption(option)
    }, [props])

    return <div id="scatter3d" style={{ width: '100%', height: 1000, backgroundColor: '#fff' }}></div>
}

export default Scatter3d 