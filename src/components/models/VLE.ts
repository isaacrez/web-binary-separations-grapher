class VLE {
  constructor(light, heavy) {
    this._light = light
    this._heavy = heavy
    this._xMoleFraction = []
    this._yMoleFraction = []
    this._calculateVLE()
  }

  set lightChemical(light) {
    this._light = light
    this._calculateVLE()
  }

  set heavyChemical(heavy) {
    this._heavy = heavy
    this._calculateVLE()
  }

  setNewChemicals(light, heavy) {
    this._light = light
    this._heavy = heavy
    this._calculateVLE()
  }

  get temperatureRange () { return this._temperatureRange }
  get xMoleFraction () { return this._xMoleFraction }
  get yMoleFraction () { return this._yMoleFraction }

  _calculateVLE() {
    const loBP = this._light.boilingPt
    const hiBP = this._heavy.boilingPt

    let temperatureRange = this._linspace(loBP, hiBP, 101)
    console.log(loBP, hiBP)
    console.log(temperatureRange)
    // console.log("[" + temperatureRange.reduce((p, n) => p + n + ", ", "") + "]")
    this._xMoleFraction = []
    this._yMoleFraction = []

    for (let t in temperatureRange) {
      let liquidFraction = this._calculateX(t)
      this._xMoleFraction.push(liquidFraction)
      this._yMoleFraction.push(this._calculateY(t, liquidFraction))
    }
  }

  _calculateX(t) {
    // Calculates the fraction of the liquid that is the light component
    // Based on Raoult's law in a binary system
    const lightSatP = this._light.getSatPressure(t)
    const heavySatP = this._heavy.getSatPressure(t)
    return (760 - heavySatP) / (lightSatP - heavySatP)
  }

  _calculateY(t, liquidFraction) {
    // Calculates the fraction of vapor atmosphere caused by the light component
    // Based on Raoult's Law
    const lightSatP = this._light.getSatPressure(t)
    return liquidFraction * lightSatP / 760
  }

  _linspace(init, final, elementCount) {
    const array = []
    const stepsize = (final - init) / (elementCount - 1)
    for (let i = 0; i < elementCount; i++) {
      array.push(init + stepsize * i)
    }

    return array
  }
}

export default VLE;
