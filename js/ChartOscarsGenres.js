export default class ChartOscarsGenres {

	constructor(options) {

		let that = this;

		let nested = d3.nest()
			.key(function(d) {
				return d.category;
			})
			.entries(options.data);

		this.genresNominees = this.getFrequencies(nested, false);

		this.genresWinners = this.getFrequencies(nested, true);

		this.data = this.genresNominees.map(function(e) {
			let frequenciesNominees = e.frequencies;
			let category = e.category;
			let frequenciesWinners = frequenciesNominees.map(function(e) {
				let genre = e.genre;
				let element = that.genresWinners.find(function(e) {
					return e.category == category;
				}).frequencies.find(function(e) {
					return e.genre == genre;
				});
				return element ? element : {
					winners: true,
					genre,
					number: 0,
					frequency: 0,
					examples: []
				};
			});
			return {
				category,
				frequencies: frequenciesNominees.concat(frequenciesWinners).filter(function(e) {
					return e != undefined;
				})
			}
		});

		this.filteredData = this.data[0].frequencies;

		this.colorWinner = options.colors.colorWinner;
		this.colorNominee = options.colors.colorNominee;

		this.tooltipEnabled = false;

		this.element = options.element;

		this.draw();
	}

}


ChartOscarsGenres.prototype.draw = function() {

	this.width = 600;
	this.height = 750;
	this.margin = 50;
	this.marginLeft = 140;

	this.createSVG();
	this.createScales();
	this.createAxes();
	this.createTooltip();

	this.createGroups();
	this.createCircles();
	this.createLines();

	this.createLegend();

}


ChartOscarsGenres.prototype.createSVG = function() {

	this.svg = d3.select(this.element)
		.append('svg')
			.attr('viewBox', `0 0 ${this.width} ${this.height}`);

	this.svg.append('svg:defs').append('svg:marker')
	    .attr('id', 'triangle')
	    .attr('refX', 6)
	    .attr('refY', 6)
	    .attr('markerWidth', 30)
	    .attr('markerHeight', 30)
	    .attr('markerUnits','userSpaceOnUse')
	    .attr('orient', 'auto')
	    .append('path')
		    .attr('d', 'M 0 0 12 6 0 12 3 6')
		    .attr('fill', 'black')

}


ChartOscarsGenres.prototype.createScales = function() {

	this.xScale = d3.scaleLinear()
		.domain([0, d3.max(this.filteredData, function(d) {
			return d.frequency;
		})])
		.rangeRound([this.marginLeft, this.width - this.margin]);

	this.yScale = d3.scalePoint()
		.domain(
			this.filteredData.filter(function(e) {
				return !e.winners;
			})
			.sort(function(a, b) {
				return b.frequency - a.frequency;
			}).map(function(e) {
				return e.genre;
			})
		)
		.padding(0.2)
		.rangeRound([this.margin, this.height - this.margin]);

}


ChartOscarsGenres.prototype.createAxes = function() {

	this.grid = d3.axisBottom(this.xScale)
		.tickSize(this.height - this.margin * 2)
		.tickSizeOuter(0)
		.tickFormat('');
	this.svg.append('g')
		.attr('class', 'grid')
		.attr('transform', `translate(0, ${this.margin})`)
		.style('stroke-dasharray', '5 5')
		.call(this.grid);
	this.svg.select('.grid').select('path')
		.style('opacity', 0);

	this.xAxis = d3.axisTop(this.xScale)
		.tickSizeOuter(0)
		.tickFormat(d3.format('.0%'));
	this.svg.append('g')
		.attr('class', 'xAxis')
		.attr('transform', `translate(0, ${this.margin})`)
		.call(this.xAxis);
	this.svg.select('.xAxis').select('path')
		.attr('marker-end', 'url(#triangle)');

	this.yAxis = d3.axisLeft(this.yScale)
		.tickSizeOuter(0);
	this.svg.append('g')
		.attr('class', 'yAxis')
		.attr('transform', `translate(${this.marginLeft}, 0)`)
		.call(this.yAxis);

}


ChartOscarsGenres.prototype.createTooltip = function() {

	this.tooltip = d3.select(d3.select(this.element).node().parentNode).append('div')
	    .attr('class', 'tooltip')
		.attr('id', 'tooltipOscarsGenres')
	    .style('opacity', 0);

}


ChartOscarsGenres.prototype.createGroups = function() {

	let that = this;

	this.yScale.domain().forEach(function(genre) {
		let group = that.svg.append('g')
			.attr('id', genre.replace(/ /g, '-').toLowerCase())
			.attr('class', 'genre')
			.on('mouseover', function() {
				if (!that.tooltipEnabled) return null;
				let dataNominees = d3.select(this.childNodes[1]).selectAll('circle').filter(function() {
					return d3.select(this).attr('fill') == that.colorNominee;
				}).data()[0];
				let dataWinners = d3.select(this.childNodes[1]).selectAll('circle').filter(function() {
					return d3.select(this).attr('fill') == that.colorWinner;
				}).data()[0];
				that.tooltip.html(that.getTooltip(dataNominees, dataWinners))
					.style('left', function() {
						return `${d3.mouse(this.parentNode)[0]}px`;
					})
					.style('top', function() {
						return `${d3.mouse(this.parentNode)[1]}px`;
					});
				that.tooltip
					.transition()
					.duration(200)
					.style('opacity', .9);
			})
			.on('mouseout', function(d) {
				that.tooltip
					.transition()
					.duration(200)
					.style('opacity', 0);
			})
			.style('opacity', 0);
		group.append('g')
			.attr('class', 'line');
		group.append('g')
			.attr('class', 'circles');
	});

}


ChartOscarsGenres.prototype.createCircles = function() {

	let that = this;

	this.filteredData.forEach(function(e) {
		that.svg.select(`#${e.genre.replace(/ /g, '-').toLowerCase()}`).select('.circles')
			.append('circle')
				.datum(e)
				.attr('fill', function(d) {
					return (d.winners) ? that.colorWinner : that.colorNominee;
				})
				.attr('cx', function(d) {
					return that.xScale(d.frequency);
				})
				.attr('cy', function(d) {
					return that.yScale(d.genre);
				})
				.attr('r', 8)
				.style('opacity', function(d) {
					return (d.winners) ? 0 : 1;
				})
				.style('cursor', 'pointer');
	});

}


ChartOscarsGenres.prototype.createLines = function() {

	let that = this;

	this.filteredData.forEach(function(e) {
		let genre = e.genre;
		if (e.winners) {
			let nominees = that.filteredData.find(function(e) {
				return ((e.genre == genre) && !e.winners);
			});
			that.svg.select(`#${e.genre.replace(/ /g, '-').toLowerCase()}`).select('.line')
				.append('line')
				.attr('x1', that.xScale(e.frequency))
				.attr('y1', that.yScale(genre))
				.attr('x2', that.xScale(nominees.frequency))
				.attr('y2', that.yScale(genre))
				.style('stroke', (e.frequency > nominees.frequency) ? that.colorWinner : that.colorNominee)
		    	.style('stroke-width', 3)
		    	.style('opacity', 0)
		    	.style('cursor', 'pointer');
		}
	});

}


ChartOscarsGenres.prototype.createLegend = function() {

	this.svg.append('text')
		.attr('x', this.width - this.margin)
		.attr('y', this.margin - 30)
		.attr('text-anchor', 'end')
		.style('font-style', 'italic')
		.text('Fréquence');

	this.legend = this.svg.append('g')
		.attr('class', 'legend')
		.style('opacity', 0);

	for (let i = 0; i < 2; i++) {

		this.legend.append('circle')
		.attr('cx', this.width/2 - 120 + 200*i)
		.attr('cy', this.height - this.margin + 25)
		.attr('r', 8)
		.attr('fill', (i == 0) ? this.colorWinner : this.colorNominee);

		this.legend.append('text')
			.attr('x', this.width/2 - 100 + 200*i)
			.attr('y', this.height - this.margin + 25)
			.attr('text-anchor', 'start')
			.attr('alignment-baseline', 'central')
			.text((i == 0) ? 'Films récompensés' : 'Films nommés');
	}

}


ChartOscarsGenres.prototype.update = function(category, specialAction) {

	let that = this;

	this.category = category;

	this.filteredData = this.data.find(function(e) {
		return e.category == that.category;
	}).frequencies;

	switch(specialAction) {

		case 'showNominees':
			this.svg.selectAll('.genre')
				.transition()
				.duration(1000)
				.style('opacity', 1);
	        break;

		case 'showWinners':
			this.tooltipEnabled = true;
			this.legend
				.transition()
				.duration(1000)
				.style('opacity', 1);
			this.svg.selectAll('circle')
				.transition()
				.duration(1000)
				.style('opacity', 1);
			this.svg.selectAll('line')
				.transition()
				.duration(1000)
				.style('opacity', 0.6);
			break;

		default:
			this.updateAxes();
			this.updateCircles();
			this.updateLines();
	}

}


ChartOscarsGenres.prototype.updateAxes = function() {

	this.xScale.domain([0, d3.max(this.filteredData, function(d) {
		return d.frequency;
	})]);

	this.yScale.domain(
		this.filteredData.filter(function(e) {
			return !e.winners;
		})
		.sort(function(a, b) {
			return b.frequency - a.frequency;
		}).map(function(e) {
			return e.genre;
		})
	);

	this.svg.select('.xAxis')
		.transition()
		.delay(200)
		.duration(1000)
		.call(this.xAxis);

	this.svg.select('.grid')
		.transition()
		.delay(200)
		.duration(1000)
		.call(this.grid);

	this.svg.select('.yAxis')
		.transition()
		.delay(200)
		.duration(1000)
		.call(this.yAxis);
}


ChartOscarsGenres.prototype.updateCircles = function() {

	let that = this;

	this.svg.selectAll('.genre')
		.each(function() {
			let genre = d3.select(this).attr('id');
			if (that.filteredData.findIndex(function(e) {
				return e.genre.replace(/ /g, '-').toLowerCase() == genre;
			}) == -1) {
				d3.select(this)
					.transition()
					.duration(1000)
					.style('opacity', 0);
			}
			else {
				d3.select(this)
					.transition()
					.duration(1000)
					.style('opacity', 1);
			}
		});

	this.filteredData.forEach(function(e) {
		let circles = that.svg.select(`#${e.genre.replace(/ /g, '-').toLowerCase()}`).selectAll('circle')
		circles.each(function() {
			let circle = d3.select(this);
			if ((circle.attr('fill') == that.colorWinner) == e.winners) {
				circle
					.datum(e)
					.transition()
					.duration(1000)
						.attr('fill', function(d) {
							return (d.winners) ? that.colorWinner : that.colorNominee;
						})
						.attr('cx', function(d) {
							return that.xScale(d.frequency);
						})
						.attr('cy', function(d) {
							return that.yScale(d.genre);
						});
			}
		});
	});

}


ChartOscarsGenres.prototype.updateLines = function() {

	let that = this;

	this.filteredData.forEach(function(e) {
		let genre = e.genre;
		if (e.winners) {
			let nominees = that.filteredData.find(function(e) {
				return ((e.genre == genre) && !e.winners);
			});
			that.svg.select(`#${e.genre.replace(/ /g, '-').toLowerCase()}`).select('line')
				.transition()
				.duration(1000)
				.attr('x1', that.xScale(e.frequency))
				.attr('y1', that.yScale(genre))
				.attr('x2', that.xScale(nominees.frequency))
				.attr('y2', that.yScale(genre))
				.style('stroke', (e.frequency > nominees.frequency) ? that.colorWinner : that.colorNominee);
		}
	});
}


ChartOscarsGenres.prototype.getTooltip = function(dataNominees, dataWinners) {

	let examplesLine = (dataWinners.number == 0) ? `<i>${dataNominees.examples.slice(0, 3).join(', ')}${(dataNominees.examples.length > 3) ? '...' : ''}</i> étai${(dataNominees.examples.length > 1) ? 'en' : ''}t nommé${(dataNominees.examples.length > 1) ? 's' : ''}</p>` : `<i>${dataWinners.examples.slice(0, 3).join(', ')}${(dataWinners.examples.length > 3) ? '...' : ''}</i></p>`;
	let mainLine = `<p><img src='./media/oscar.svg' width=20 style='display: inline-block; margin: 0;' /><b>${(dataWinners.number == 0) ? 'Aucun film récompensé&nbsp;: ' : d3.format('.0%')(dataWinners.number / dataNominees.number) + " des films nommés ont reçu l'Oscar&nbsp;: "}</b>` + examplesLine;

	let nomineesLine = `<p style='text-align: left; margin-top: 5px;'><span style='color: ${this.colorNominee};'>⬤</span> <i>${dataNominees.number} film${(dataNominees.number > 1) ? 's' : ''} nommé${(dataNominees.number > 1) ? 's' : ''} (${d3.format('.1~%')(dataNominees.frequency)})</i></p>`;
	let winnersLine = `<p style='text-align: left;'><span style='color: ${this.colorWinner};'>⬤</span> <i>${dataWinners.number} film${(dataWinners.number > 1) ? 's' : ''} récompensé${(dataWinners.number > 1) ? 's' : ''} (${d3.format('.1~%')(dataWinners.frequency)})</i></p>`;

	return `
		<h3>${dataNominees.genre}</h3>
		${mainLine}
		${nomineesLine}
		${(dataWinners.number == 0) ? '' : winnersLine}
	`;

}


ChartOscarsGenres.prototype.getFrequencies = function(data, winning) {

	var genres = [];

	for (let element of data) {
		let category = element.key;
		let movies = element.values;
		if (winning) {
			movies = movies.filter(function(movie) {
				return movie.winner;
			});
		}

		let dictionary = {};
		let sum = 0;
		for (let movie of movies) {
			let genre1 = movie.genre1;
			let genre2 = movie.genre2;
			let genre3 = movie.genre3;
			(dictionary.hasOwnProperty(genre1)) ? dictionary[genre1] += 1 : dictionary[genre1] = 1;
			if (genre2 != '') {
				(dictionary.hasOwnProperty(genre2)) ? dictionary[genre2] += 1 : dictionary[genre2] = 1;
			}
			if (genre3 != '') {
				(dictionary.hasOwnProperty(genre3)) ? dictionary[genre3] += 1 : dictionary[genre3] = 1;
			}
			sum++;
		}

		let frequencies = [];
		for (let i = 0; i < Object.keys(dictionary).length; i++) {
			let examples = [];
			for (let movie of movies) {
				if ((movie.category == category) && (movie.genre1 == Object.keys(dictionary)[i])) {
					examples.push(movie);
				}
			}
			if (examples.length < 3) {
				for (let movie of movies) {
					if ((movie.category == category) && (movie.genre2 == Object.keys(dictionary)[i])) {
						examples.push(movie);
					}
				}
			}
			if (examples.length < 3) {
				for (let movie of movies) {
					if ((movie.category == category) && (movie.genre3 == Object.keys(dictionary)[i])) {
						examples.push(movie);
					}
				}
			}
			examples.sort(function(a, b) {
				return a.rank - b.rank;
			});
			frequencies.push({
				winners: winning,
				genre: this.translate(Object.keys(dictionary)[i]),
				number: Object.values(dictionary)[i],
				frequency: Object.values(dictionary)[i] / sum,
				examples: examples.map(function(e) {
					return e.title;
				})
			});
		}
		genres.push({
			category: category,
			frequencies: frequencies
		});
	}

	return genres;
}


ChartOscarsGenres.prototype.translate = function(genre) {
	let genres = ['Drama', 'Romance', 'Comedy', 'Biography', 'History', 'Adventure', 'Crime', 'Thriller', 'War', 'Action', 'Mystery', 'Family', 'Fantasy', 'Musical', 'Music', 'Western', 'Sport', 'Sci-Fi', 'Film-Noir', 'Animation', 'Horror'];
	let translations = ['Drame', 'Film romantique', 'Comédie', 'Biopic', 'Film historique', 'Aventure', 'Crime', 'Thriller', 'Film de guerre', 'Action', 'Mystère', 'Film familial', 'Fantastique', 'Comédie musicale', 'Film musical', 'Western', 'Sport', 'Science-fiction', 'Film noir', 'Animation', 'Horreur'];
	return translations[genres.indexOf(genre)];
}
