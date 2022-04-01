import React from 'react'
import Plot from 'react-plotly.js'
import './styles/App.css'

import { chemicals } from './constants/antoines'
import Chemical from './models/Chemical'
import VLE from './models/VLE'
import Selector from './Selector'

function App() {
  const [lightName, setLightName] = React.useState("benzene")
  const [heavyName, setHeavyName] = React.useState("toluene")

  React.useEffect(() => {
    const light = new Chemical(lightName)
    const heavy = new Chemical(heavyName)

    if (light.boilingPt > heavy.boilingPt) {
      let temp = lightName
      setLightName(heavyName)
      setHeavyName(temp)
    }
  }, [lightName, heavyName])

  const light = new Chemical(lightName)
  const heavy = new Chemical(heavyName)
  const vleObj = new VLE(light, heavy)

  const chemicalNames = Object.keys(chemicals)

  const liquidGraph: any = {
    x: vleObj.temperatureRange,
    y: vleObj.xMoleFraction,
    name: "liquid",
    type:'scatter'
  }

  const gaseousGraph: any = {
    x: vleObj.temperatureRange,
    y: vleObj.yMoleFraction,
    name: "gas",
    type:'scatter'
  }

  return (
    <div className="App">
      <h1>Binary Separations</h1>

      <Plot data={[liquidGraph, gaseousGraph]} layout={{}} />

      <div className="chemical-wrapper">
        <p>Chemical Selection</p>
        <div style={{ display: "flex", flexDirection: "row", gap: "30px" }}>
          <Selector value={lightName} setValue={setLightName} options={chemicalNames.filter(n => n !== heavyName)} />
          <Selector value={heavyName} setValue={setHeavyName} options={chemicalNames.filter(n => n !== lightName)} />
        </div>
      </div>
    </div>
  );
}

export default App
