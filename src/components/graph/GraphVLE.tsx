import React from 'react'
import Plot from 'react-plotly.js'
import VLE from '../models/VLE'

function GraphVLE(props: {VLE: VLE}) {
  const layout: any = {
    xaxis: {
      title: 'Temperature (K)',
      gridcolor: 'rgba(255, 255, 255,0.25)',
      range: [0, 1]
    },
    yaxis: {
      title: 'Fraction Light Component',
      gridcolor: 'rgba(255, 255, 255,0.25)',
      range: [0, 1]
    },
    legend: {
      x: 0.015,
      xanchor: 'left',
      y: 0.985,
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

  const diagonal: any = {
    x: [0, 1],
    y: [0, 1],
    name: '',
    type: 'scatter',
    line: {
      color: 'rgba(255, 255, 255, 0.5)',
      dash: 'dot'
    },
    showlegend: false
  }

  const vleGraph: any = {
    x: props.VLE.xMoleFraction,
    y: props.VLE.yMoleFraction,
    name: 'VLE',
    type:'scatter',
    line: {
      color: 'rgb(50, 50, 235)'
    }
  }

  return (
    <Plot data={[diagonal, vleGraph]} layout={layout} config={config} />
  )
}

export default GraphVLE;
