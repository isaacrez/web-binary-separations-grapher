import React from 'react'
import './styles/App.css'

import Chemical from './models/Chemical'
import Selector from './Selector.tsx'

function App() {
  const [chemName, setChemName] = React.useState("water")
  const chemical = new Chemical(chemName)

  const chemOptions = ["water", "n-butane", "benzene", "toluene"]

  return (
    <div className="App">
      <h1>Binary Separations</h1>
      <p>{chemical.getName()} boils at {Math.round(chemical.getBoilingPt())}!</p>
      <Selector value={chemName} setValue={setChemName} options={chemOptions} />
    </div>
  );
}

export default App
