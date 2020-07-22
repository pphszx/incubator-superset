import React from 'react';
import Funnel from './Funnel';
import BarRace from './BarRace';
import Sankey from './Sankey';
import GridLine from './GridLine';

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
  }

  return <React.Fragment>'vis type not exists'</React.Fragment>;
};

export default Vis;
