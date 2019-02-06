const texts = {
	'Best Picture': 
		`<p>Drame, film romantique et biopic, sans surprise, arrivent en tête des genres les plus nommés et récompensés pour l'Oscar du meilleur film. Les comédies sont autant nommées que les biopics, mais seules 16&nbsp;% d'entre elles reçoivent une statuette. A l'inverse, les films de guerre ne constituent que 7&nbsp;% des nominations, mais sont récompensés dans plus d'un tiers des cas.</p>`,
	'Best Directing':
		`<p>Comme pour l'Oscar du meilleur film, drame, film romantique et biopic sont le trio de tête des genres les plus récompensés. Les comédies sont une nouvelle fois désavantagées, puisque bien qu'elles représentent 21&nbsp;% des nominations, elles ne sont que 17&nbsp;% des films à recevoir une statuette. Les films de guerre sont encore une fois sur-représentés parmi les films récompensés, puisque près de la moitié des 27 films nommés se sont vu remettre le prix.</p>`,
	'Best Cinematography':
		`<p>L'Oscar de la meilleure photographie est plus éclectique. Le drame reste le genre prédominant, mais les films romantiques, les films d'aventure, les films historiques et les biopics représentent tous entre 20 et 25&nbsp;% des films récompensés. Encore une fois, les comédies sont nettement sous-représentées : bien qu'elles constituent 15&nbsp;% des nominations, elles ne reçoivent la statuette que dans 8&nbsp;% des cas.</p>`,
	'Best Visual Effects':
		`<p>Un peu de changement pour l'Oscar des meilleurs effets visuels, où les genres les plus nommés et récompensés sont les films d'aventure et d'action, les drames, les films de science-fiction et les films fantastiques. Malgré tout, l'Académie semble biaisée contre les films d'action, puisque seuls 27&nbsp;% des films de ce genre nommés se sont vu remettre une statuette. A l'inverse, près de la moitié des 77 drames nommés ont reçu une statuette.</p>`,
	'Best Original Screenplay':
		`<p>Drame, films romantiques et comédies dominent l'Oscar du meilleur scénario original. Néanmoins les comédies sont encore une fois sous-représentées parmi les films récompensés : bien qu'elles soient bien plus souvent nommées que les films romantiques, elles disposent du même nombre de statuettes.</p>`,
	'Best Adapted Screenplay':
		`<p>Pour l'Oscar du meilleur scénario adapté, on retrouve le même trio de tête que pour les Oscars du meilleur film et de la meilleure réalisaiton : drames, films romantiques et biopics. Encore une fois les comédies sont désavantagées, puisqu'elles constituent 22&nbsp;% des films nommés mais ne reçoivent une statuette que dans 13&nbsp;% des cas. Ce biais contre les comédies se fait au profit des biopics, qui représentent un quart des films récompensés, et des films historiques pour lesquels 38&nbsp;% des nommés ont remporté le prix.</p>`
}


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

		this.texts = texts;

		this.element = options.element;

		this.draw();

	}

}


ChartOscarsGenres.prototype.draw = function() {

	this.width = 400;
	this.height = 800;
	this.margin = 50;

	this.createSVG();
	this.createScales();
	this.createAxes();
	this.createTooltip();

	this.getMenu();

	this.createBars();
	this.createAreas();

	this.update(this.select.property('value'));

}


ChartOscarsGenres.prototype.createSVG = function() {

	this.svg = d3.select(this.element)
		.append('svg')
			.attr('viewBox', `0 0 ${this.width} ${this.height}`)
			.attr('preserveAspectRatio', 'xMidYMid slice');

}


ChartOscarsGenres.prototype.createScales = function() {

	this.xScale =  d3.scaleBand()
		.domain(['Films nommés', 'Films récompensés'])
		.paddingInner(0.6)
		.paddingOuter(0)
		.rangeRound([this.margin, this.width - this.margin]);

	this.yScale =  d3.scaleLinear()
		.domain([0, 100])
		.rangeRound([this.height - this.margin, this.margin]);

}


ChartOscarsGenres.prototype.createAxes = function() {

	this.xAxis = d3.axisBottom(this.xScale).tickSize(0);
	this.svg.append('g')
		.attr('class', 'xAxis')
		.attr('transform', `translate(0, ${this.height - this.margin})`)
		.call(this.xAxis);

	// this.yAxis = d3.axisLeft(this.yScale).tickSize(0);
	// this.svg.append('g')
	// 	.attr('class', 'yAxis')
	// 	.attr('transform', `translate(${this.margin}, 0)`)
	// 	.call(this.yAxis);

	this.color = d3.scaleOrdinal()
		.range(['#FF0000', '#800000', '#FFFF00', '#808000', '#00FF00', '#008000', '#00FFFF', '#008080', '#0000FF', '#000080', '#800080'])

}


ChartOscarsGenres.prototype.createTooltip = function() {

	this.tooltip = d3.select(this.element).append('div')
	    .attr('class', 'tooltip')
	    .style('opacity', 0);

}


ChartOscarsGenres.prototype.createBars = function() {

	let that = this;

   	this.nomineesStack = this.svg.append('g')
    	.attr('class', 'stack')
    	.attr('transform', function(d) {
    		return `translate(${that.xScale('Films nommés')}, 0)`;
    	});

    this.winnersStack = this.svg.append('g')
    	.attr('class', 'stack')
    	.attr('transform', function(d) {
    		return `translate(${that.xScale('Films récompensés')}, 0)`;
    	});

    this.bars = this.svg.selectAll('.stack');

}


ChartOscarsGenres.prototype.createAreas = function() {

	let that = this;

	this.area = d3.area()
    	.x(function (d) {
			return (d.id == 'Films nommés') ? that.xScale(d.id) + that.xScale.bandwidth() : that.xScale(d.id);
		})
    	.y0(function (d) {
    		return that.yScale(d.values.y0);
    	})
    	.y1(function (d) {
    		return that.yScale(d.values.y1);
    	})
    	.curve(d3.curveNatural);


    this.areas = this.svg.append('g')
    	.attr('class', 'areas');

}


ChartOscarsGenres.prototype.getMenu = function() {

	let that = this;

	this.select = d3.select('#selectCategoryGenres')
    	.on('change', function() {
			that.update(that.select.property('value'));
		});

}


ChartOscarsGenres.prototype.update = function(category) {

	let that = this;

	this.category = category;
	
	this.nominees = this.genresNominees.find(function(e) {
		return e.category == that.category;
	}).frequencies
	.sort(function(a, b) {
		return a.frequency - b.frequency;
	});

	this.winners = this.genresWinners.find(function(e) {
		return e.category == that.category;
	}).frequencies
	.sort(function(a, b) {
		return a.frequency - b.frequency;
	});

	console.log(this.nominees, this.winners)

	this.updateAxis();
	this.updateBars();
	this.updateAreas();

	this.updateText();

}


ChartOscarsGenres.prototype.updateAxis = function() {

	this.yScale
		.domain([0, Math.max(
			d3.sum(this.winners, function(d) {
				return d.frequency;
			}),
			d3.sum(this.nominees, function(d) {
				return d.frequency;
			})
		)]);

	// this.svg.select('.yAxis')
	// 	.transition()
	// 	.duration(1000)
	// 	.call(this.yAxis);

}


ChartOscarsGenres.prototype.updateBars = function() {

	let that = this;

	this.nomineesKeys = this.nominees.map(function(e) {
    	return e.genre;
	});

	let y0 = 0;
	this.nomineesData = this.nomineesKeys.map(function(key, index) {
    	return {
    		id: 'Films nommés',
    		values: {
	    	 	genre: key,
	    	 	number: that.nominees[index].number,
	    	 	frequency: that.nominees[index].frequency,
	    	 	examples: that.nominees[index].examples,
	    	 	y0: y0,
	    	 	y1: y0 += that.nominees[index].frequency
	    	}
	    };
	});
		
	let winnersKeys = this.winners.map(function(e) {
    	return e.genre;
	});

	y0 = 0;
   	this.winnersData = winnersKeys.map(function(key, index) {
		return {
    		id: 'Films récompensés',
    		values: {
	    	 	genre: key,
	    	 	number: that.winners[index].number,
	    	 	frequency: that.winners[index].frequency,
	    	 	examples: that.winners[index].examples,
	    	 	y0: y0,
	    	 	y1: y0 += that.winners[index].frequency
	    	}
    	}
   	});

   	this.nomineesStack.datum(this.nomineesData);
   	this.winnersStack.datum(this.winnersData);

   	this.color.domain(this.nomineesKeys);

   	let bars = this.bars.selectAll('rect')
		.data(function(d) {
			return d;
		});

	bars.exit()
		.transition()
		.duration(1000)
		.style('opacity', 0)
		.remove();


	bars.enter()
		.append('rect')
	    	.on('mouseover', function(d) {
	    		that.areas.select(`#${d.values.genre.replace(/ /g, '-').toLowerCase()}`)
	    			.transition()
	    			.duration(200)
	    			.style('opacity', 0.4);
				that.tooltip
					.transition()
					.duration(200)
					.style('opacity', 0.9);
				that.tooltip.html(that.getTooltip(d))
					.style('left', function() {
						return `${d3.event.pageX - this.offsetWidth / 2}px`;
					})
					.style('top', `${(d3.event.pageY + 30)}px`)
			})
			.on('mouseout', function(d) {
				that.areas.select(`#${d.values.genre.replace(/ /g, '-').toLowerCase()}`)
					.transition()
	    			.duration(200)
	    			.style('opacity', 0);
				that.tooltip
					.transition()
					.duration(500)
					.style('opacity', 0);
			})	
			.attr('y', function(d) {
		    return that.yScale(d.values.y1);
			})
			.attr('width', this.xScale.bandwidth())
			.attr('height', function(d) {
			    return that.yScale(d.values.y0) - that.yScale(d.values.y1);
		    })
	    	.attr('fill', function(d) {
	    		return that.color(d.values.genre);
	    	})
	    	.style('opacity', 0)
	    		.transition()
				.duration(1000)
				.style('opacity', 0.8)
			.style('cursor', 'pointer');

	bars
		.transition()
		.duration(1000)
		.attr('y', function(d) {
		    return that.yScale(d.values.y1);
		})
		.attr('height', function(d) {
		    return that.yScale(d.values.y0) - that.yScale(d.values.y1);
	    })
	    .attr('fill', function(d) {
	    	return that.color(d.values.genre);
	    });
	
}


ChartOscarsGenres.prototype.updateAreas = function() {

	let that = this;

	this.svg.selectAll('.curve')
		.transition()
		.duration(1000)
		.style('opacity', 0)
		.remove();

	this.nomineesKeys.forEach(function(key) {
    	let forNominees = that.nomineesData.filter(function(e) {
    		return e.values.genre == key;
    	});
    	let forWinners = that.winnersData.filter(function(e) {
    		return e.values.genre == key;
    	});
    	that.areas.append('path')
    		.datum(forNominees.concat(forWinners))
    		.attr('class', 'curve')
    		.attr('id', function(d) {
    			return d[0].values.genre.replace(/ /g, '-').toLowerCase();
    		})
			.attr('d', that.area)
			.attr('fill', function(d) {
    			return that.color(d[0].values.genre)
    		})
    		.style('opacity', 0)
	    		.transition()
	    		.delay(1000)
				.duration(1000)
				.style('opacity', 0);
	});
}



ChartOscarsGenres.prototype.updateText = function() {

	d3.select('#oscarsGenresSection').select('.comment').html(
		this.texts[this.category] +
		`<br><br><i><p>Les données sont issues de <a href='https://www.imdb.com/'>l'Internet Movie Database (IMDb)</a>.</p>
			<p>A chaque film sont associés entre un et trois genres : le total est donc supérieur à 100&nbsp;%.</p></i>`
	);	
}




ChartOscarsGenres.prototype.translate = function(genre) {
	let genres = ['Drama', 'Romance', 'Comedy', 'Biography', 'History', 'Adventure', 'Crime', 'Thriller', 'War', 'Action', 'Mystery', 'Family', 'Fantasy', 'Musical', 'Music', 'Western', 'Sport', 'Sci-Fi', 'Film-Noir', 'Animation', 'Horror'];
	let translations = ['Drame', 'Film romantique', 'Comédie', 'Biopic', 'Film historique', 'Aventure', 'Crime', 'Thriller', 'Film de guerre', 'Action', 'Mystère', 'Film familial', 'Fantastique', 'Comédie musicale', 'Film musical', 'Western', 'Sport', 'Science-fiction', 'Film noir', 'Animation', 'Horreur'];
	return translations[genres.indexOf(genre)];
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


ChartOscarsGenres.prototype.getTooltip = function(d) {

	let winner = (d.id == 'Films récompensés');
	let data = d.values;
	let plural = (data.number > 1);

	if (winner) {
		var nomineesNumber = this.nominees.find(function(e) {
			return e.genre == data.genre;
		}).number;
	}
	
	return `
		<h3>${data.genre}</h3>
		<p style='text-align: center;'>${data.number} film${plural ? 's' : ''} ${(winner) ? 'récompensé' : 'nommé'}${(plural) ? 's' : ''}</p>
		${winner ? "<p style='text-align: center;'><i>(soit " + d3.format('.1~%')(data.number / nomineesNumber) + ' des nommés)</i></p>' : ''}
		<p style='text-align: center;'>${d3.format('.1~%')(data.frequency)} des  ${(winner) ? 'récompenses' : 'nominations'}</p>
		<p><i>${data.examples.slice(0, 3).join(', ')}${(data.examples.length > 3) ? '...' : ''}</i></p>
	`;

}
	