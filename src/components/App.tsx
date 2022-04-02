import React from 'react'
import './styles/App.css'

import Chemical from './models/Chemical'
import VLE from './models/VLE'
import GraphTxy from './graph/GraphTxy'
import GraphVLE from './graph/GraphVLE'
import Siderail from './Siderail'

function App() {
  const [lightName, setLightName] = React.useState("benzene")
  const [heavyName, setHeavyName] = React.useState("toluene")
  const siderailProps = {
    lightName: lightName,
    setLightName: setLightName,
    heavyName: heavyName,
    setHeavyName: setHeavyName
  }

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


  return (
    <div className="App">
      <Siderail {...siderailProps} />
      <h1>Binary Separations</h1>
      <GraphTxy VLE={vleObj} />
      <GraphVLE VLE={vleObj} />
    </div>
  );
}

export default App
