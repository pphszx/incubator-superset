import React, { useEffect } from 'react'
// import echarts from 'echarts/lib/echarts';
import * as echarts from 'echarts';

const randomColor = () => {
    return `rgb(${255 * Math.random()}, ${255 * Math.random()}, ${255})`;
}

const genTooltipsFormatterStr = (e, first, second, third, cols) => {
    let res = `${e[first]} > ${e[second]} <br />
        ${cols[2]}: ${e[third]} <br />
        `
    for (let i = 3; i < cols.length; i++) {
        res += `${cols[i]}: ${e[cols[i]]} <br />`
    }

    return res
}

const Sankey = props => {
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
                        "value": e[value],
                        tooltip: { formatter: genTooltipsFormatterStr(e, source, target, value, columns) }
                    }
                )
            });

            nodes.forEach(n => {
                let color = randomColor()
                nodes_list.push({
                    "name": n,
                    "itemStyle": {
                        "normal": {
                            "color": color,
                            "borderColor": color
                        }
                    }
                })

            })

            var mychart = echarts.init(document.getElementById('sankey'))
            console.log('nodes_list', nodes_list)
            console.log('linkes', links)
            let option = {
                title: {
                    subtext: props.title,
                    left: 'center'
                },
                // backgroundColor: "",
                series: [
                    {
                        type: "sankey",
                        left: 50.0,
                        top: 20.0,
                        right: 150.0,
                        bottom: 25.0,
                        layoutIterations: (props.params ? props.params.layoutIterations : 1),
                        data: nodes_list,
                        links: links,
                        lineStyle: {
                            color: "source",
                            curveness: 0.5
                        },
                        itemStyle: {
                            color: "#1f77b4",
                            borderColor: "#1f77b4"
                        },
                        label: {
                            // color: "rgba(0,0,0,0.7)",
                            color: "#ffffff",
                            fontFamily: "Arial",
                            fontSize: 15
                        },
                        tooltip: {
                            formatter: '{b} {c}',
                        }
                    }],
                tooltip: {
                    trigger: "item"
                }
            }

            mychart.setOption(option)
        }
    }, [props])


    return <div id="sankey" style={{ width: '100%', height: 1000, backgroundColor: '#393862' }}></div>
}

export default Sankey