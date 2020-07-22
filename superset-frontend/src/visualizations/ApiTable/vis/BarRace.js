import React, { useEffect } from 'react';
import BarChart from './BarRace/BarChart';
import data from './BarRace/data';

const randomColor = () => {
    return `rgb(${255 * Math.random()}, ${255 * Math.random()}, ${255})`;
}


// const time = Array(20).fill(0).map((itm, idx) => idx + 1);

// console.log('data', data)   // 省份分组唯一序列
// console.log('time', time)   // 月份唯一排序
// console.log('colors', colors) // 随机

const BarRace = props => {

    console.log('props.data', props.data)
    console.log('props.columns', props.columns)

    const k = props.columns[0]["dataIndex"] // key column
    const t = props.columns[1]["dataIndex"] // time column
    const v = props.columns[2]["dataIndex"] // value column
    console.log('k', k)
    console.log('t', t)
    console.log('v', v)

    let times_set = new Set()
    props.data.forEach(d => {
        times_set.add(d[t])
    })

    let times = Array.from(times_set)

    let key_series_data = {}

    props.data.forEach(d => {
        if (d[k] in key_series_data) {
            const idx = times.indexOf(d[t])
            key_series_data[d[k]][idx] = d[v]
        } else {
            key_series_data[d[k]] = new Array(times.length).fill(0)
        }
    });

    console.log('key_series_data', key_series_data)
    const keys = Object.keys(key_series_data);
    const labels = keys.reduce((res, item, idx) => {
        return {
            ...res,
            ...{
                [item]: (
                    <div style={{ textAlign: "center", }}>
                        <div style={{ color: "#ffffff" }}>{item}</div>
                    </div>
                )
            }
        }
    }, {});
    const len = data[Object.keys(data)[0]].length;
    const colors = keys.reduce((res, item) => ({
        ...res,
        ...{ [item]: randomColor() }
    }), {});

    return <div className="container">
        <BarChart
            start={true}
            data={key_series_data}
            timeline={times}
            labels={labels}
            colors={colors}
            len={len}
            timeout={1000}
            delay={150}
            timelineStyle={{
                textAlign: "center",
                fontSize: "80px",
                color: "#ffffff",
                marginBottom: "100px"
            }}
            textBoxStyle={{
                textAlign: "right",
                color: "#ffffff",
                fontSize: "30px",
            }}
            barStyle={{
                height: "60px",
                marginTop: "10px",
                borderRadius: "2px",
            }}
            width={[15, 75, 10]}
            maxItems={25}
        />
    </div>
}

export default BarRace

