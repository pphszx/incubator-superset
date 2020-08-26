import React from 'react';
import Funnel from './Funnel';
import BarRace from './BarRace';
import Sankey from './Sankey';
import GridLine from './GridLine';
import Heat from './Heat';
import Scatter3d from './Scatter3d';

const Vis = (props) => {
  if (props.type === 'funnel') {
    return (
      <Funnel
        data={props.data}
        columns={props.columns}
        title={props.title}
        params={props.params}
      />
    );
  } else if (props.type === 'bar_race') {
    return (
      <BarRace
        data={props.data}
        columns={props.columns}
        title={props.title}
        params={props.params}
      />
    );
  } else if (props.type === 'sankey') {
    return (
      <Sankey
        data={props.data}
        columns={props.columns}
        title={props.title}
        params={props.params}
      />
    );
  } else if (props.type === 'gridline') {
    return (
      <GridLine
        data={props.data}
        columns={props.columns}
        title={props.title}
        params={props.params}
      />
    );
  } else if (props.type === 'heat') {
    return (
      <Heat
        data={props.data}
        columns={props.columns}
        title={props.title}
        params={props.params}
      />
    );
  } else if (props.type === 'scatter3d') {
    return (
      <Scatter3d
        data={props.data}
        columns={props.columns}
        title={props.title}
        params={props.params}
      />
    )

  }

  return <React.Fragment>'vis type not exists'</React.Fragment>;
};

export default Vis;
