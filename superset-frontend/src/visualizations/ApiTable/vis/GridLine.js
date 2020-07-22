import React, { useEffect } from 'react'
import * as echarts from 'echarts';

// const randomColor = () => {
//     return `rgb(${255 * Math.random()}, ${255 * Math.random()}, ${255})`;
// }

const GridLine = props => {
    useEffect(() => {
        if (props.data !== undefined && props.data.length !== 0) {

            const columns = props.columns.map(col => col.dataIndex)

            const source = columns[0]
            const target = columns[1]
            const value = columns[2]

            let nodes = new Set()
            let nodes_list = []
            let links = []

            props.data.forEach(e => {
                nodes.add(e[source])
                nodes.add(e[target])
                links.push(
                    {
                        "source": e[source],
                        "target": e[target],
                        "value": e[value]
                    }
                )
            });
            var easingFuncs = {
                // 积极对待: function(k){
                //     return 1/k
                // }
            };

            var N_POINT = 30;

            var grids = [];
            var xAxes = [];
            var yAxes = [];
            var series = [];
            var titles = [];
            var count = 0;
            echarts.util.each(easingFuncs, function (easingFunc, name) {
                console.log('name', name)
                var data = [];
                for (var i = 0; i <= N_POINT; i++) {
                    var x = i / N_POINT;
                    var y = easingFunc(x);
                    data.push([x, y]);
                }
                grids.push({
                    show: false,
                    borderWidth: 0,
                    backgroundColor: '#393862',
                    shadowColor: 'rgba(0, 0, 0, 0.3)',
                    shadowBlur: 22
                });
                xAxes.push({
                    type: 'value',
                    show: false,
                    min: 0,
                    max: 1,
                    gridIndex: count
                });
                yAxes.push({
                    type: 'value',
                    show: false,
                    min: -0.4,
                    max: 1.4,
                    gridIndex: count
                });
                series.push({
                    name: name,
                    type: 'line',
                    xAxisIndex: count,
                    yAxisIndex: count,
                    data: data,
                    showSymbol: false,
                    animationEasing: "bounceOut",
                    animationDuration: 5000,
                    color: "#ffffff"
                });
                titles.push({
                    textAlign: 'center',
                    text: name,
                    textStyle: {
                        fontSize: 12,
                        fontWeight: 'normal',
                        color: '#ffffff'
                    }
                });
                count++;
            });

            var rowNumber = Math.ceil(Math.sqrt(count));
            echarts.util.each(grids, function (grid, idx) {
                grid.left = ((idx % rowNumber) / rowNumber * 100 + 0.5) + '%';
                grid.top = (Math.floor(idx / rowNumber) / rowNumber * 100 + 0.5) + '%';
                grid.width = (1 / rowNumber * 100 - 1) + '%';
                grid.height = (1 / rowNumber * 100 - 1) + '%';

                titles[idx].left = parseFloat(grid.left) + parseFloat(grid.width) / 2 + '%';
                titles[idx].top = parseFloat(grid.top) + '%';
            });

            var mychart = echarts.init(document.getElementById('GridLine'))
            let option = {
                title: titles.concat([{
                    text: props.title,
                    top: 'bottom',
                    left: 'center',
                    textStyle: { color: '#393862' }
                }]),
                grid: grids,
                xAxis: xAxes,
                yAxis: yAxes,
                series: series
            };

            mychart.setOption(option)
        }
    }, [props])


    return <div id="GridLine" style={{ width: '100%', height: 1000, backgroundColor: '#393862' }}></div>
}

export default GridLine 