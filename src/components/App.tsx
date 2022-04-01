import React from 'react'
import './styles/App.css'

import { chemicals } from './constants/antoines'
import Chemical from './models/Chemical'
import VLE from './models/VLE'
import GraphTxy from './graph/GraphTxy'
import GraphVLE from './graph/GraphVLE'
import Selector from './Selector'

function App() {
  const [lightName, setLightName] = React.useState("benzene")
  const [heavyName, setHeavyName] = React.useState("toluene")
  const [open, setOpen] = React.useState(true)

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

  return (
    <div className="App">
      <button className="side-button" onClick={() => {setOpen(!open)}}>{open ? "<<" : ">>"}</button>

      {open && <div className="side-bar">
        <div>
          <p>Chemical Selection</p>
          <Selector label="Light" value={lightName} setValue={setLightName} options={chemicalNames.filter(n => n !== heavyName)} />
          <Selector label="Heavy" value={heavyName} setValue={setHeavyName} options={chemicalNames.filter(n => n !== lightName)} />
        </div>
      </div>}

      <div>
        <h1>Binary Separations</h1>

        <GraphTxy VLE={vleObj} />
        <GraphVLE VLE={vleObj} />
      </div>
    </div>
  );
}

export default App
