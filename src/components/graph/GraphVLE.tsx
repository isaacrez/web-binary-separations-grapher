import React from 'react'
import Plot from 'react-plotly.js'
import VLE from '../models/VLE'

function GraphVLE(props: {VLE: VLE}) {
  const layout: any = {
    title: 'Vapor-Liquid Equilibrium',
    xaxis: {
      title: 'Temperature (K)',
      gridcolor: 'rgba(255, 255, 255,0.25)'
    },
    yaxis: {
      title: 'Fraction Light Component',
      gridcolor: 'rgba(255, 255, 255,0.25)',
      range: [0, 1]
    },
    legend: {
      x: 1,
      xanchor: 'right',
      y: 1,
      bgcolor: 'rgba(1, 1, 1, 0.75)'
    },
    font: {
      family: 'Courier New, monospace',
      size: '16',
      color: 'rgb(0.85, 0.85, 0.85)'
    },
    plot_bgcolor: 'rgba(0,0,0,0)',
    paper_bgcolor: 'rgba(0,0,0,0)'
  }

  const config: any = {
    displayModeBar: false
  }

  const liquidGraph: any = {
    x: props.VLE.temperatureRange,
    y: props.VLE.xMoleFraction,
    name: 'liquid',
    type:'scatter',
    line: {
      color: 'rgb(50, 50, 235)'
    }
  }

  const gaseousGraph: any = {
    x: props.VLE.temperatureRange,
    y: props.VLE.yMoleFraction,
    name: 'gas',
    type:'scatter',
    line: {
      color: 'rgb(235, 50, 50)'
    }
  }

  return (
    <Plot data={[liquidGraph, gaseousGraph]} layout={layout} config={config} />
  )
}

export default GraphVLE;
