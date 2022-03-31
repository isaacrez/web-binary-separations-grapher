import { chemicals } from '../constants/antoines.ts';

class Chemical {
  constructor(name) {
    this._name = name

    let antoines = chemicals[name]
    this._A = antoines[0]
    this._B = antoines[1]
    this._C = antoines[2]

    this._boilingPt = this._B / (this._A - Math.log(760)) - this._C
  }

  getSatPressure = tempK => Math.exp(this._A - this._B / (this._C + tempK))

  get name () { return this._name }
  get boilingPt () { return this._boilingPt }
}

export default Chemical
