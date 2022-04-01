import React from 'react'
import Plot from 'react-plotly.js'
import VLE from '../models/VLE'

function GraphVLE(props: {VLE: VLE}) {
  const liquidGraph: any = {
    x: props.VLE.temperatureRange,
    y: props.VLE.xMoleFraction,
    name: "liquid",
    type:'scatter'
  }

  const gaseousGraph: any = {
    x: props.VLE.temperatureRange,
    y: props.VLE.yMoleFraction,
    name: "gas",
    type:'scatter'
  }

  return (
    <Plot data={[liquidGraph, gaseousGraph]} layout={{}} />
  )
}

export default GraphVLE;
