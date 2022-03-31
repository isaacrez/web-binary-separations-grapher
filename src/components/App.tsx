import React from 'react'
import './styles/App.css'

import { chemicals } from './constants/antoines.ts'
import Chemical from './models/Chemical.ts'
import Selector from './Selector.tsx'

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

  const chemicalNames = Object.keys(chemicals)

  return (
    <div className="App">
      <h1>Binary Separations</h1>
      <p>{light.name} boils at {Math.round(light.boilingPt)}K!</p>
      <Selector value={lightName} setValue={setLightName} options={chemicalNames.filter(n => n !== heavyName)} />

      <p>{heavy.name} boils at {Math.round(heavy.boilingPt)}K!</p>
      <Selector value={heavyName} setValue={setHeavyName} options={chemicalNames.filter(n => n !== lightName)} />
    </div>
  );
}

export default App
