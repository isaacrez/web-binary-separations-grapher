import { chemicals } from '../constants/antoines.ts';

class Chemical {
  constructor(name) {
    this.name = name

    let antoines = chemicals[name]
    this._A = antoines[0]
    this._B = antoines[1]
    this._C = antoines[2]

    this.boilingPt = this._calculateBoilingPoint()
  }

  _calculateBoilingPoint = () => this._B / (this._A - Math.log(760)) - this._C

  getSatPressure = tempK => Math.exp(this._A - this._B / (this._C + tempK))

  getName = () => this.name
  getBoilingPt = () => this.boilingPt
}

export default Chemical
