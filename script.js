
console.log('Program started...')
//require('chart.js')

class BinarySystem {

	constructor (chemical_1, chemical_2, distillation_tower) {
		/* 	Creates a system of two chemicals, organized based on boiling points,
			then generates the vapor liquid equilibrium information */
		this._lightChemical = chemical_1;
		this._heavyChemical = chemical_2;
		this._ensureCorrectChemicalLabels();
		this.tower = distillation_tower;
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

	constructor (xD=0.95, xF=0.4, xB=0.2, murphree=1.0){
		this._xD = xD;
		this._xF = xF;
		this._xB = xB;
		this._murphree = murphree;
	}

	set xD(xD) {
		if (this._xF < xD && xD <= 1) {
			this._xD = xD;
		} else {
			console.log("Failed to set new xD");
		}
	};

	set xF(xF) {
		if (this._xB < xF && xF < this._xD) {
			this._xF = xF;
		} else {
			console.log("Failed to set new xF");
		}
	}

	set xB(xB) {
		if (0 < xB && xB < this._xF) {
			this._xB = xB;
		} else {
			console.log("Failed to set new xB");
		}
	}

	set murphree(newMurphree) {
		if (0 < murphree && murphree <= 1) {
			this._murphree = murphree;
		} else {
			console.log("Failed to set new murphree efficiency");
		}
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

	get tempRange () {return this._tempRange};
	get liquidFraction () {return this._xRange};
	get vaporFraction () {return this._yRange};

	_calculateVaporLiquidEquilibria () {
		/* 	Generates the x and y values for various temperatures between the chemical's
		   	boiling points */
		let lowerBP = this._lightChemical.boilingPoint;
		let upperBP = this._heavyChemical.boilingPoint;
		let temperatureRange = linspace(lowerBP, upperBP, 100);
		let lightLiquidFraction = [];
		let lightVaporFraction = [];

		for (let i = 0; i < temperatureRange.length; i++){
			let currTemp = temperatureRange[i];
			let currLiquidFrac = this._calculateX(currTemp);
			let currVaporFrac = this._calculateY(currTemp, currLiquidFrac);

			lightLiquidFraction.push(currLiquidFrac);
			lightVaporFraction.push(currVaporFrac);
		}

		this._tempRange = temperatureRange;
		this._xRange = lightLiquidFraction;
		this._yRange = lightVaporFraction;

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

function linspace(initValue, finalValue, elementCount) {
	let array = [];
	let stepsize = (finalValue - initValue) / (elementCount - 1);
	for (let i = 0; i < elementCount; i++){
		array.push(initValue + stepsize * i);
	}

	return array;
}

const chemicals = {};
chemicals['water'] = new Chemical('water',18.3036,3816.44,-46.13);
chemicals['n-butane'] = new Chemical('n-butane',15.6782,2154.90,-34.42);
chemicals['n-pentane'] = new Chemical('n-pentane',15.8333,2477.07,-39.94);


tower = new DistillationTower();
system = new BinarySystem(chemicals['water'], chemicals['n-butane'], tower);
//system.lightChemical = chemicals['n-pentane'];

function createGraph() {
	let context = document.getElementById('myChart').getContext('2d');
	let myChart = new Chart(context, {
	    type: 'line',

	    // The data for our dataset
	    data: {
	        labels: system.VLE.tempRange,
	        datasets: [{
	            label: 'Liquid Curve',
	            borderColor: 'rgb(0, 0, 255)',
	            backgroundColor: 'rgba(0, 0, 0, 0)',
	            data: system.VLE.liquidFraction,
	        },
	        {
	        	label: 'Vapor Curve',
	        	borderColor: 'rgb(255, 0, 0)',
	            backgroundColor: 'rgba(0, 0, 0, 0)',
	        	data: system.VLE.vaporFraction,
	        }],
	    },

	   	options: {
	   		elements: {
	   			point: {
	   				radius: 0,
	   			}
	   		}
	   	}
   	})
}

createGraph()
