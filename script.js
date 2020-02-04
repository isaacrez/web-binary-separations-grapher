
console.log('Program started...')

class Distillation {
	/* Handles distillation calculations, including McCabe Thiele steps */

	constructor (binarySystem, towerSpecs) {
		this._binarySystem = binarySystem;
		this._towerSpecs = towerSpecs;

		this.stepPts = [];
		this.totalStages = 0;
		this.feedStage = 0;
		this.generateSteps();
	}

	set chemical_1(chemical) {
		this._binarySystem.chemical_1 = chemical;
		this.generateSteps();
	}
	set chemical_2(chemical) {
		this._binarySystem.chemical_2 = chemical;
		this.generateSteps();
	}

	set R(R) {
		this._towerSpecs.R = R;
		this.generateSteps();
	}
	set xB(xB) {
		this._towerSpecs.xB = xB;
		if (this._towerSpecs.xB == xB) {
			this.generateSteps();
		}
	}
	set xF(xF) {
		this._towerSpecs.xF = xF;
		if (this._towerSpecs.xF == xF) {
			this.generateSteps();
		}
	}
	set xD(xD) {
		this._towerSpecs.xD = xD;
		if (this._towerSpecs.xD == xD) {
			this.generateSteps();
		}
	}
	set murphree(murphree) {
		this._towerSpecs.murphree = murphree;
		if (this._towerSpecs.murphree == murphree) {
			this.generateSteps();
		}
	}

	get binarySystem() {return this._binarySystem};
	get towerSpecs() {return this._towerSpecs};

	get chemical_1() {return this._binarySystem.chemical_1};
	get chemical_2() {return this._binarySystem.chemical_2};
	get R() {return this._towerSpecs.R};
	get xB() {return this._towerSpecs.xB};
	get xF() {return this._towerSpecs.xF};
	get xD() {return this._towerSpecs.xD};
	get murphree() {return this._towerSpecs.murphree};

	generateSteps() {
		let VLE = this._binarySystem.VLE;
		let xEqPts = VLE.xMoleFraction;
		let yEqPts = VLE.yMoleFraction; 

		this.feedStage = 0;
		this.totalStages = 0;

		this.getEffectiveEq();

		if (this._towerSpecs.murphree == 1) {
			this.performIdealSteps(xEqPts, yEqPts)
		} else {
			this.performRealSteps(xEqPts, yEqPts)
		}
	}

	performIdealSteps(xEqPts, yEqPts) {
		let [xStep, yStep] = this.getStartingSteps();

		while (this._towerSpecs.xB < xStep && this.totalStages < 100) {
			xStep = linearlyInterpolate(yStep, yEqPts, xEqPts);
			this.stepPts.push({x: xStep, y: yStep});
			yStep = this._towerSpecs.getOperatingY(xStep);
			this.stepPts.push({x: xStep, y: yStep})

			this.totalStages++;
			this.checkForFeedStage(xStep);
		}
	}

	performRealSteps(xEqPts, yEqPts) {
		let [xStep, yStep] = this.getStartingSteps();

		while (this._towerSpecs.xB < xStep && this.totalStages < 100) {
			xStep = linearlyInterpolate(yStep, yEqPts, xEqPts);
			if (this._towerSpecs.xB < xStep) {
				xStep = linearlyInterpolate(yStep, this.yEffPts, xEqPts)
			}
			this.stepPts.push({x: xStep, y: yStep});
			yStep = this._towerSpecs.getOperatingY(xStep);
			this.stepPts.push({x: xStep, y: yStep})

			this.totalStages++;
			this.checkForFeedStage(xStep);
		}
	}

	getStartingSteps() {
		let xStep = this._towerSpecs.xD;
		let yStep = this._towerSpecs.xD;
		this.stepPts = [{x: xStep, y: yStep}]

		return [xStep, yStep]
	}

	checkForFeedStage(xStep) {
		if (this.feedStage == 0) {
			if (xStep < this._towerSpecs.xF) {
				this.feedStage = this.totalStages;
			}
		}
	}

	getEffectiveEq() {
		this.yEffPts = [];

		if (this._towerSpecs.murphree == 1) {
			return;
		}

		let VLE = this._binarySystem.VLE;
		let xFrac = VLE.xMoleFraction;
		let yFrac = VLE.yMoleFraction;
		let murphree = this._towerSpecs.murphree;

		for (let i = 0; i < yFrac.length; i++) {
			let yOP = this._towerSpecs.getOperatingY(xFrac[i])
			let yEff = murphree * (yFrac[i] - yOP) + yOP;
			this.yEffPts.push(yEff);
		}
	}

	plottableEffectiveEq() {
		let VLE = this._binarySystem.VLE;
		let xFrac = VLE.xMoleFraction;
		let yFrac = this.yEffPts;
		let points = []

		for (let i = 0; i < yFrac.length; i++) {
			points.push({
				x: xFrac[i], y: yFrac[i]
			})
		}
		return points;
	}

	getEffectiveY(yEquilibrium, yOP) {
		return this._towerSpecs.murphree * (yEquilibrium - yOP) + yOP;
	}


}

class BinarySystem {

	constructor (chemical_1, chemical_2) {
		/* 	Creates a system of two chemicals, organized based on boiling points,
			then generates the vapor liquid equilibrium information */
		this._chemical_1 = chemical_1;
		this._chemical_2 = chemical_2;
		this._lightChemical;
		this._heavyChemical;

		this._setChemicalLabels();
		this.VLE = new VaporLiquidEquilibria(this._lightChemical, this._heavyChemical);
	}

	// Used primarily for calculations
	get lightChemical () {return this._lightChemical};
	get heavyChemical () {return this._heavyChemical};
	// Used primarily for UI interaction
	get chemical_1 () {return this._chemical_1};
	get chemical_2 () {return this._chemical_2};

	set chemical_1 (chemical) {
		this._chemical_1 = chemical;
		this._setChemicalLabels();
		this._updateVLE();
	}

	set chemical_2 (chemical) {
		this._chemical_2 = chemical;
		this._setChemicalLabels();
		this._updateVLE();
	}

	_setChemicalLabels () {
		if (this._chemical_1.boilingPoint < this._chemical_2.boilingPoint) {
			this._lightChemical = this._chemical_1;
			this._heavyChemical = this._chemical_2;
		} else {
			this._lightChemical = this._chemical_2;
			this._heavyChemical = this._chemical_1;
		}
	}

	_updateVLE () {
		this.VLE.setNewChemicals(this._lightChemical, this._heavyChemical)
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

	set murphree(murphree) {
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

	getOperatingPoints() {
		let xB = this._xB;
		let xF = this._xF;
		let xD = this._xD
		return [{x: xB, y: xB},
				{x: xF, y: this.getOperatingY(xF)},
				{x: xD, y: xD}];
	}

	getOperatingY(x) {
		if (this.xF < x) {
			var m = this.m['rectifying'];
			var b = this.b['rectifying'];
		} else if (this.xB < x) {
			var m = this.m['stripping'];
			var b = this.b['stripping']
		} else {
			return x;
		}

		return m*x + b;
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

	setNewChemicals(lightChemical, heavyChemical) {
		this._lightChemical = lightChemical;
		this._heavyChemical = heavyChemical;
		this._calculateVaporLiquidEquilibria();
	};


	get temperatureRange () {return this._temperatureRange};
	get xMoleFraction () {return this._xFractions};
	get yMoleFraction () {return this._yFractions};

	_calculateVaporLiquidEquilibria () {
		/* 	Generates the x and y values for various temperatures between the chemical's
		   	boiling points */
		let lowerBP = this._lightChemical.boilingPoint;
		let upperBP = this._heavyChemical.boilingPoint;
		let temperatureRange = linspace(lowerBP, upperBP, 101);
		let xMoleFraction = [];
		let yMoleFraction = [];

		for (let i = 0; i < temperatureRange.length; i++){
			let currTemp = temperatureRange[i];
			let currLiquidFrac = this._calculateX(currTemp);
			let currVaporFrac = this._calculateY(currTemp, currLiquidFrac);

			xMoleFraction.push(currLiquidFrac);
			yMoleFraction.push(currVaporFrac);
		}

		this._temperatureRange = temperatureRange;
		this._xFractions = xMoleFraction;
		this._yFractions = yMoleFraction;

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

	constructor(chartID) {
		this.context = document.getElementById(chartID).getContext('2d');
		this.chart = new Chart(this.context, {})
	}

	resetConfiguration() {
		this.config = {
			type: 'scatter',

			data: {datasets: []},

			options: {
				legend: {
					display: false
				},
				elements: {point: {radius: 0}},
				scales: {
					xAxes: [{}],
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
	}

	resetChart() {
		this.chart.destroy()
		this.chart = new Chart(this.context, this.config)
	}

	templateDataSet(color='red') {
		return {
			borderColor: color,
			backgroundColor: 'transparent',
			showLine: true,
			lineTension: 0,
			borderWidth: 1
		}
	}

	addPlotElement(name, data, color='red', dashed=false) {
		let element = this.templateDataSet(color);

		element['label'] = name;
		element['data'] = data;
		if (dashed) {
			element['borderDash'] = [10, 5];
		}

		this.config['data']['datasets'].push(element);
	}

	adjustScale(newMin, newMax) {
		this.config['options']['scales']['xAxes'][0]['ticks'] = {
			min: newMin,
			max: newMax,
			maxTicksLimit: 11
		}
	}

	addTxyPlot(objVLE) {
		let TxyData = objVLE.getPointsTxy();
		let Tx = TxyData[0];
		let Ty = TxyData[1];

		this.addPlotElement('Liquid', Tx, 'blue');
		this.addPlotElement('Vapor', Ty);
		this.adjustScale(Tx[0]['x'], Tx[Tx.length-1]['x']);
	}

	addVLEPlot(objVLE) {
		this.addPlotElement('VLE', objVLE.getPointsVLE(), 'blue');
		this.adjustScale(0, 1);
	}

	addDistillationElements(objDistill) {
		this.addPlotElement('Stages', objDistill.stepPts, 'green', true);
		this.addPlotElement('Effective Eq.', objDistill.plottableEffectiveEq(), 'blue', true);
		this.addPlotElement('OP line', objDistill.towerSpecs.getOperatingPoints(), 'grey');
	}

	// TODO Add OperatingLinePlot
	// TODO Add McCabeTheilePlot

	addDiagonalPlot() {
		let diagonalPoints = [{x: 0, y: 0},		{x: 1, y: 1}];
		this.addPlotElement('Diagonal', diagonalPoints, 'white', true);
	}

	plotTxy(objVLE) {
		this.resetConfiguration();

		this.addTxyPlot(objVLE);

		this.resetChart();
	}

	plotVLE(objVLE) {
		this.resetConfiguration();

		this.addVLEPlot(objVLE);
		this.addDiagonalPlot();

		this.resetChart();
	}

	plotDistillation(objDistill) {
		this.resetConfiguration();

		this.addVLEPlot(objDistill.binarySystem.VLE);
		this.addDistillationElements(objDistill)
		this.addDiagonalPlot();

		this.resetChart();
	}

}

class inputHandler {
	constructor(chartID) {
		this.chemicals = {};
		this._loadChemicals();

		let initialChemical1 = this.chemicals['n-pentane'];
		let initialChemical2 = this.chemicals['n-butane'];

		comboBoxes[0].value = initialChemical1.name;
		comboBoxes[1].value = initialChemical2.name;

		// Data Objects
		this.tower = new DistillationTower();
		this.system = new BinarySystem(initialChemical1, initialChemical2);
		this.distillation = new Distillation(this.system, this.tower);
		this.distillation.murphree = 0.67;

		// Plotting
		this.plt = new Plotter(chartID);
		this.pltType = 'distillation';
		this.updatePlot();
		this.updateTitle();
	}

	_loadChemicals() {
		// Hardcoded in since this is all the chemicals that will be used in this project anyway
		this.chemicals['water']				= new Chemical('water',18.3036,3816.44,-46.13);
		this.chemicals['n-butane']			= new Chemical('n-butane',15.6782,2154.90,-34.42);
		this.chemicals['n-pentane']			= new Chemical('n-pentane',15.8333,2477.07,-39.94);
		this.chemicals['n-hexane']			= new Chemical('n-hexane',15.8366,2697.55,-48.78);
		this.chemicals['n-heptane']			= new Chemical('n-heptane',15.8737,2911.32,-56.51);
		this.chemicals['n-octane']			= new Chemical('n-octane',15.9426,3120.29,-63.63);
		this.chemicals['n-nonane']			= new Chemical('n-nonane',15.9671,3291.45,-71.33);
		this.chemicals['n-decane']			= new Chemical('n-decane',16.0114,3456.80,-78.67);
		this.chemicals['n-hexadecane']		= new Chemical('n-hexadecane',16.1841,4214.91,-118.70);
		this.chemicals['benzene']			= new Chemical('benzene',15.9008,2788.51,-52.36);
		this.chemicals['toluene']			= new Chemical('toluene',16.0137,3096.52,-53.67);
		this.chemicals['ethylbenzene']		= new Chemical('ethylbenzene',16.0195,3279.47,-59.95);
		this.chemicals['1-propylbenzene']	= new Chemical('1-propylbenzene',16.0062,3433.84,-66.01);
		this.chemicals['1-butylbenzene']	= new Chemical('1-butylbenzene',16.0793,3633.40,-71.77);
		this.chemicals['methanol']			= new Chemical('methanol',18.5875,3626.55,-34.29);
		this.chemicals['ethanol']			= new Chemical('ethanol',18.9119,3803.98,-41.68);
		this.chemicals['1-propanol']		= new Chemical('1-propanol',17.5439,3166.38,-80.15);
		this.chemicals['1-butanol']			= new Chemical('1-butanol',17.2160,3137.02,-94.43);
		this.chemicals['1-pentanol']		= new Chemical('1-pentanol',16.5270,3026.89,-105.00);
		this.chemicals['1-octanol']			= new Chemical('1-octanol',15.7428,3017.81,-137.10);
		this.chemicals['1-lacticacid']		= new Chemical('1-lacticacid',16.0785,4276.57,-91.00);
		this.chemicals['l-lactide']			= new Chemical('l-lactide',19.6150,7279.91,0.00);
	}

	updatePlot() {
		this.updateTitle();
		this.updateStageDisplay();
		if (this.pltType == 'distillation') {
			this.plt.plotDistillation(this.distillation);
		} else if (this.pltType == 'VLE') {
			this.plt.plotVLE(this.system.VLE);
		} else if (this.pltType == 'Txy') {
			this.plt.plotTxy(this.system.VLE);
		}
	}

	updateChemicalInput(ID) {
		let comboBox = document.getElementById(ID);
		let chemicalName = comboBox.value;
		let newChemical = this.chemicals[chemicalName];

		if (this.confirmNotPresent(chemicalName)) {
			if (ID == 'chemical_1') {
				this.distillation.chemical_1 = newChemical;
			} else if (ID == 'chemical_2') {
				this.distillation.chemical_2 = newChemical;
			}
			this.updatePlot();

		} else {
			if (ID == 'chemical_1') {
				comboBox.value = this.distillation.chemical_1.name;
			} else {
				comboBox.value = this.distillation.chemical_2.name;
			}
		}
	}

	updateTowerInput(ID) {
		let textBox = document.getElementById(ID);
		let text = textBox.value;
		let changed = false;
		
		// Update Distillation variable retrieval to get rid of this BS
		if (ID == 'R') {
			this.distillation.R = text;
			if (this.distillation.R == text) {
				changed = true;
			}

		} else if (ID == 'xB') {
			this.distillation.xB = text;
			if (this.distillation.xB == text) {
				changed = true;
			}

		} else if (ID == 'xF') {
			this.distillation.xF = text;
			if (this.distillation.xF == text) {
				changed = true;
			}

		} else if (ID == 'xD') {
			this.distillation.xD = text;
			if (this.distillation.xD == text) {
				changed = true;
			}

		} else if (ID == 'murphree') {
			this.distillation.murphree = text;
			if (this.distillation.murphree == text) {
				changed = true;
			}
		}

		if (changed) {
			this.updatePlot();
		}
	}

	updateTitle() {
		let title = document.getElementById('chartTitle');
		let lightChemicalName = this.system.lightChemical.name;
		let heavyChemicalName = this.system.heavyChemical.name;
		title.textContent = lightChemicalName + " v. " + heavyChemicalName;
	}

	updateStageDisplay() {
		let optimalStage = document.getElementById('totalStages');
		let feedStage = document.getElementById('feedStage');

		optimalStage.textContent = this.distillation.totalStages;
		feedStage.textContent = this.distillation.feedStage;

	}

	confirmNotPresent(chemicalName) {
		if (this.distillation.chemical_1.name == chemicalName) {
			return false;
		}
		if (this.distillation.chemical_2.name == chemicalName) {
			return false;
		}
		return true;
	}
}

// Processing elements as variables
let comboBoxID = ['chemical_1', 'chemical_2']

let comboBoxes = [
	document.getElementById(comboBoxID[0]),
	document.getElementById(comboBoxID[1])
];

IP = new inputHandler('myChart');

// Wiring event listeners
comboBoxes[0].addEventListener("change", function() {IP.updateChemicalInput(comboBoxID[0])});
comboBoxes[1].addEventListener("change", function() {IP.updateChemicalInput(comboBoxID[1])});
