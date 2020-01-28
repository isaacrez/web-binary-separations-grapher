
const fs = require('fs');

// Need to set up jQuery to make AJAX request for file info
function process_csv(_callback) {

	fs.readFile('antoineData.csv', 'utf-8', (err, data) => {
		const chemicals = {};
		const allLines = data.split(/\r\n|\n/);
		allLines.forEach((line) => {
			
			const elements = line.split(",");
			let name = elements[0];
			let A = elements[1];
			let B = elements[2];
			let C = elements[3];
			chemical = new Chemical(name, A, B, C);
			chemicals[name] = chemical;

		})
		return chemicals;
	})
}



let R = true;

R ? console.log("It was true!") : console.log("Nope...");

const isFuncky = number_one => console.log("It is " + number_one + "!");
