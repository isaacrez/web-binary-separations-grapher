
console.log('Program started...')
//require('chart.js')

class Distillation {
	/* Handles distillation calculations, including McCabe Thiele steps */

	constructor (binarySystem, towerSpecs) {
		this._binarySystem = binarySystem;
		this._towerSpecs = towerSpecs;
		this._stepPoints = this.generateSteps();
	}

	generateSteps() {
		VLE = this._BinarySystem.VLE;
		let xStep = this._towerSpecs.xD;
		let yStep = this._towerSpecs.xD;
		let c = 0;

		while (this._towerSpecs.xB < xStep && c < 100) {

			c++;
		}

	}

	getEffectiveY(yEquilibrium, yOP) {
		return this._towerSpecs.murphree * (yEquilibrium - yOP) + yOP;
	}

	getOperatingY(x) {
		let xF = this._towerSpecs.xF;
		let xB = this._towerSpecs.xB;

		if (xF < x) {
			var m = this._towerSpecs.m['rectifying'];
			var b = this._towerSpecs.b['rectifying'];
		} else if (xB < x) {
			var m = this._towerSpecs.m['stripping'];
			var b = this._towerSpecs.b['stripping']
		} else {
			return x;
		}

		return m*x + b;
	}


}

class BinarySystem {

	constructor (chemical_1, chemical_2) {
		/* 	Creates a system of two chemicals, organized based on boiling points,
			then generates the vapor liquid equilibrium information */
		this._lightChemical = chemical_1;
		this._heavyChemical = chemical_2;
		this._ensureCorrectChemicalLabels();
		this.VLE = new VaporLiquidEquilibria(this._lightChemical, this._heavyChemical);

	}

	set lightChemical (chemical) {
		this._lightChemical = chemical;
		this._ensureCorrectChemicalLabels();
		this.VLE.lightChemical = this._lightChemical;
	}

	set heavyChemical (chemical) {
		this._heavyChemical = chemical;
		this._ensureCorrectChemicalLabels();
		this.VLE.heavyChemical = this._heavyChemical;
	}

	_ensureCorrectChemicalLabels () {
		if (this._heavyChemical.boilingPoint < this._lightChemical.boilingPoint) {
			let tempChemical = this._heavyChemical;
			this._heavyChemical = this._lightChemical;
			this._lightChemical = tempChemical;
		}
	}

}

class DistillationTower {

	constructor (xD=0.95, xF=0.4, xB=0.2, R=1.0, murphree=1.0){
		this._xD = xD;
		this._xF = xF;
		this._xB = xB;
		this._R = R;
		this._murphree = murphree;

		this.m = {};
		this.b = {};
		this.calculateOperatingParameters();
	}

	set xD(xD) {
		if (this._xF < xD && xD <= 1) {
			this._xD = xD;
			this.calculateOperatingParameters();
		} else {
			console.log("Failed to set new xD");
		}
	};

	set xF(xF) {
		if (this._xB < xF && xF < this._xD) {
			this._xF = xF;
			this.calculateOperatingParameters();
		} else {
			console.log("Failed to set new xF");
		}
	}

	set xB(xB) {
		if (0 < xB && xB < this._xF) {
			this._xB = xB;
			this.calculateOperatingParameters();
		} else {
			console.log("Failed to set new xB");
		}
	}

	set R(_R) {
		this._R = R;
		this.calculateOperatingParameters();
	}

	set murphree(newMurphree) {
		if (0 < murphree && murphree <= 1) {
			this._murphree = murphree;
		} else {
			console.log("Failed to set new murphree efficiency");
		}
	}

	get xD() {return this._xD}
	get xF() {return this._xF}
	get xB() {return this._xB}
	get R()  {return this._R}
	get murphree() {return this._murphree}

	calculateOperatingParameters() {
		this.m['rectifying'] = this._R / (this._R + 1);
		this.b['rectifying'] = this._xD / (this._R + 1);

		let transitionY = this.m['rectifying'] * this._xF + this.b['rectifying'];
		this.m['stripping'] = (transitionY - this._xB) / (this._xF - this._xB);
		this.b['stripping'] = this._xB * (1 - this.m['stripping']);
	}

}

class VaporLiquidEquilibria {
	/* Generates the vapor liquid equilibria for two chemicals */

	constructor (lightChemical, heavyChemical) {
		this._lightChemical = lightChemical;
		this._heavyChemical = heavyChemical;
		this._calculateVaporLiquidEquilibria();
	}

	set lightChemical(lightChemical) {
		this._lightChemical = lightChemical;
		this._calculateVaporLiquidEquilibria();
	};
	set heavyChemical(heavyChemical) {
		this._heavyChemical = heavyChemical
		this._calculateVaporLiquidEquilibria();
	};

	get temperatureRange () {return this._temperatureRange};
	get lightLiquidFractions () {return this._xFractions};
	get lightvaporFractions () {return this._yFractions};

	_calculateVaporLiquidEquilibria () {
		/* 	Generates the x and y values for various temperatures between the chemical's
		   	boiling points */
		let lowerBP = this._lightChemical.boilingPoint;
		let upperBP = this._heavyChemical.boilingPoint;
		let temperatureRange = linspace(lowerBP, upperBP, 101);
		let lightLiquidFraction = [];
		let lightVaporFraction = [];

		for (let i = 0; i < temperatureRange.length; i++){
			let currTemp = temperatureRange[i];
			let currLiquidFrac = this._calculateX(currTemp);
			let currVaporFrac = this._calculateY(currTemp, currLiquidFrac);

			lightLiquidFraction.push(currLiquidFrac);
			lightVaporFraction.push(currVaporFrac);
		}

		this._temperatureRange = temperatureRange;
		this._xFractions = lightLiquidFraction;
		this._yFractions = lightVaporFraction;

	}

	_calculateX(temperature) {
		// Based on Raoult's law in a binary system
		let lightSatPressure = this._lightChemical.calculateSatPressure(temperature);
		let heavySatPressure = this._heavyChemical.calculateSatPressure(temperature);
		let x = (760 - heavySatPressure) / (lightSatPressure - heavySatPressure);
		return x;
	}

	_calculateY(temperature, liquidFraction) {
		// Based on Raoult's law
		let lightSatPressure = this._lightChemical.calculateSatPressure(temperature);
		return liquidFraction * lightSatPressure / 760;
	}

	getPointsVLE() {
		return convertArrayToPoints(this._xFractions, this._yFractions);
	}

	getPointsTxy() {
		let liquidData = convertArrayToPoints(this._temperatureRange, this._xFractions);
		let vaporData = convertArrayToPoints(this._temperatureRange, this._yFractions);
		return [liquidData, vaporData];
	}

}


class Chemical {

	constructor (name, A, B, C) {
		this.name = name;
		this.A = A;
		this.B = B;
		this.C = C;
		this.boilingPoint = this.calculateBoilingPoint();
	}

	calculateBoilingPoint() {
		return this.B / (this.A - Math.log(760)) - this.C;
	}

	calculateSatPressure(temperature) {
		return Math.exp(this.A - this.B / (this.C + temperature));
	}

}

function convertArrayToPoints(xArray, yArray) {
	let pointArray = [];
	for (let i = 0; i < xArray.length; i++) {
		let point = {
			x: xArray[i],
			y: yArray[i]
		};
		pointArray.push(point);
	}
	return pointArray;
}


function linspace(initValue, finalValue, elementCount) {
	let array = new Array(elementCount);
	let stepsize = (finalValue - initValue) / (elementCount - 1);
	for (let i = 0; i < elementCount; i++){
		array[i] = initValue + stepsize * i;
	}

	return array;
}

function linearlyInterpolate(x, xArray, yArray, index=0) {

	// Assumes bounding within 0 to 1
	if (x < 0) {return 0};
	if (1 < x) {return 1};

	if (xArray.length != yArray.length) {
		throw new Error('Arrays must be same length');
	}

	let n = xArray.length;
	let i = index;
	for (i; i < n; i++) {
		// Stop immediately after we find a higher value
		if (xArray[i] < x) {
			break
		}
	}

	let x0 = xArray[i-1];
	let x1 = xArray[i];
	let y0 = yArray[i-1];
	let y1 = yArray[i];

	let y = y0 + (x - x0) * (y1 - y0) / (x1 - x0);
	return y;

}

class Plotter {

	constructor() {
		this.context = document.getElementById('myChart').getContext('2d');
	}

	baseConfiguration() {
		let config = {
			type: 'scatter',

			data: {
				datasets: []
			},

			options: {
				elements: {
					point: {
						radius: 0,
					}
				},
				scales: {
					xAxes: [{
						ticks: {
							min: 0,
							max: 1,
							maxTicksLimit: 11
						}
					}],
					yAxes: [{
						ticks: {
							min: 0,
							max: 1,
							maxTicksLimit: 11
						}
					}]
				}
			}		
		};
		return config;
	}

	templateDataSet(color='red') {
		return {
			borderColor: color,
			backgroundColor: 'transparent',
			showLine: true,
			borderWidth: 1
		}
	}

	addPlotElement(config, name, data, color='red', dashed=false) {
		let element = this.templateDataSet(color);
		element['label'] = name;
		element['data'] = data;
		if (dashed) {
			element['borderDash'] = [10, 5];
		}

		config['data']['datasets'].push(element);
	}

	addTxyPlot(config, objVLE) {
		let TxyData = objVLE.getPointsTxy();
		let Tx = TxyData[0];
		let Ty = TxyData[1];

		this.addPlotElement(config, 'Liquid', Tx, 'blue');
		this.addPlotElement(config, 'Vapor', Ty);

		config['options']['scales']['xAxes'][0]['ticks']['min'] = Tx[0]['x'];
		config['options']['scales']['xAxes'][0]['ticks']['max'] = Tx[Tx.length - 1]['x'];
	}

	addVLEPlot(config, objVLE) {
		this.addPlotElement(config, 'VLE', objVLE.getPointsVLE(), 'blue');
	}

	addDiagonalPlot(config) {
		let diagonalPoints = [{x: 0, y: 0},		{x: 1, y: 1}];
		this.addPlotElement(config, 'Diagonal', diagonalPoints, 'black', true);
	}

	plotTxy(objVLE) {
		let config = this.baseConfiguration();
		this.addTxyPlot(config, objVLE);

		let myChart = new Chart(this.context, config);
	}

	plotVLE(objVLE) {
		let config = this.baseConfiguration(0);

		this.addVLEPlot(config, objVLE);
		this.addDiagonalPlot(config);

		let myChart = new Chart(this.context, config);
	}

	plotDistillation(objDistill) {
		let config = this.baseConfiguration();

		config['data']['datasets'][0]['label'] = 'VLE';
		config['data']['datasets'][0]['data'] = objVLE.getPointsVLE();

		this.addVLEPlot(config, objDistill.BinarySystem.VLE);
		this.addDiagonalPlot(config);

	}

}


// TESTING SECTION //
const chemicals = {};
chemicals['water'] = new Chemical('water',18.3036,3816.44,-46.13);
chemicals['n-butane'] = new Chemical('n-butane',15.6782,2154.90,-34.42);
chemicals['n-pentane'] = new Chemical('n-pentane',15.8333,2477.07,-39.94);


tower = new DistillationTower();
system = new BinarySystem(chemicals['water'], chemicals['n-butane'], tower);
system.heavyChemical = chemicals['n-pentane'];


let plt = new Plotter();

plt.plotVLE(system.VLE);
setTimeout(function() {plt.plotTxy(system.VLE)}, 2000)
