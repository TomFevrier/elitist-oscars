import ChartPopularity from './ChartPopularity.js';
import ChartEvolutionGenres from './ChartEvolutionGenres.js';
import ChartOscarsGenres from './ChartOscarsGenres.js';

export var chartPopularity, chartEvolutionGenres, chartOscarsGenres;

const colors = {
	colorWinner: '#DBA520',
	colorNominee: '#FFE333',
	colorAudience: '#0000BB',
	colorAudienceArea: '#33A5FF'
}

d3.formatDefaultLocale({
	'decimal': ',',
	'thousands': ' ',
	'grouping': [3],
	'currency': ['$', ''],
	'percent': ' %'
});

d3.tsv('./data/data.tsv', function(d) {
	return {
		title: d.title,
		year: new Date(d.year),
		genre1: d.genre1,
		genre2: d.genre2,
		genre3: d.genre3,
		rank: +d.rank,
		boxOffice: +d.boxOffice,
		category: d.category,
		winner: (d.winner == 'true')
	};
}).then(function(data) {
	drawOscarsGenres(data);
	d3.tsv('./data/oscarsAudiences.tsv', function(d) {
		return {
			year: new Date(d.year),
			audience: +d.audience
		}
	}).then(function(oscarsAudiences) {
		drawPopularity(data, oscarsAudiences);
		d3.tsv('./data/genresTopMovies.tsv', function(d) {
			return {
				title: d.title,
				year: new Date(d.year),
				genre1: d.genre1,
				genre2: d.genre2,
				genre3: d.genre3
			};
		}).then(function(audiencesData) { 
			drawEvolutionGenres(data, audiencesData);
		});
	});
});

function drawPopularity(data, oscarsAudiences) {

	var nested = d3.nest()
		.key(function(d) { return d.category; })
		.entries(data);

	chartPopularity = new ChartPopularity({
		data: nested,
		oscarsAudiences: oscarsAudiences,
		colors: colors,
		element: '#chartPopularity'
	});
}


function drawEvolutionGenres(data, audiencesData) {

	chartEvolutionGenres = new ChartEvolutionGenres({
		oscarsData: data,
		audiencesData: audiencesData,
		colors: colors,
		element: '#chartEvolutionGenres'
	});

}


function drawOscarsGenres(data) {

	chartOscarsGenres = new ChartOscarsGenres({
		data: data,
		colors: colors,
		element: '#chartOscarsGenres'
	});

}