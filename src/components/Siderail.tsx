import React from 'react'
import Selector from './Selector'
import { chemicals } from './constants/antoines'

function Siderail(props: any) {
  const chemicalNames = Object.keys(chemicals)

  return (
    <div>
      <div className="side-bar">
        <div>
          <p>Chemical Selection</p>
          <Selector label="Light" value={props.lightName} setValue={props.setLightName} options={chemicalNames.filter(n => n !== props.heavyName)} />
          <Selector label="Heavy" value={props.heavyName} setValue={props.setHeavyName} options={chemicalNames.filter(n => n !== props.lightName)} />
        </div>
      </div>
    </div>
  )
}

export default Siderail
