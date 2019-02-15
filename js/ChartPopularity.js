export default class ChartPopularity {

	constructor(options) {
		this.data = options.data;
		this.data.forEach(function(category) {
			category.values = category.values.sort(function(a, b) {
	    		return (a.winner == b.winner) ? 0 : (a.winner) ? 1 : -1;
			});
		});
		this.oscarsAudiences = options.oscarsAudiences;

		this.colorWinner = options.colors.colorWinner;
		this.colorNominee = options.colors.colorNominee;
		this.colorAudience = options.colors.colorAudience;
		this.colorAudienceArea = options.colors.colorAudienceArea;

		this.tooltipEnabled = false;

		this.element = options.element;
		this.draw();
	}

}


ChartPopularity.prototype.draw = function() {

	let containerHeight = parseInt(d3.select('#chartPopularity').style('height'));

	this.height = 800;
	this.width = 1200;
	this.margin = 60;

	this.createSVG();
	this.createScales();
	this.createAxes();
	this.createTooltip();

	this.createLineAudience();

	this.createLegend();

	this.circles = this.svg.append('g');

}


ChartPopularity.prototype.createSVG = function() {

	this.svg = d3.select(this.element)
		.append('svg')
			.attr('viewBox', `0 0 ${this.width} ${this.height}`);

	this.svg.append('svg:defs').append('svg:marker')
	    .attr('id', 'triangleBlack')
	    .attr('refX', 6)
	    .attr('refY', 6)
	    .attr('markerWidth', 30)
	    .attr('markerHeight', 30)
	    .attr('markerUnits','userSpaceOnUse')
	    .attr('orient', 'auto')
	    .append('path')
		    .attr('d', 'M 0 0 12 6 0 12 3 6')
		    .attr('fill', 'black');

	this.svg.append('svg:defs').append('svg:marker')
	    .attr('id', 'triangleBlue')
	    .attr('refX', 6)
	    .attr('refY', 6)
	    .attr('markerWidth', 30)
	    .attr('markerHeight', 30)
	    .attr('markerUnits','userSpaceOnUse')
	    .attr('orient', 'auto')
	    .append('path')
		    .attr('d', 'M 0 0 12 6 0 12 3 6')
		    .attr('fill', this.colorAudience);

}


ChartPopularity.prototype.createScales = function() {

	this.xScale = d3.scaleTime()
		.domain([new Date('1940'), new Date('2019')])
		.rangeRound([this.margin, this.width - this.margin]);

	this.yScale = d3.scaleLinear()
		.domain([1, 140])
		.rangeRound([this.margin, this.height - this.margin]);

	this.yScaleAudience = d3.scaleLinear()
		.domain([0, 56000000])
		.rangeRound([this.height - this.margin, this.margin]);

}


ChartPopularity.prototype.createAxes = function() {

	this.grid = d3.axisRight(this.yScale)
		.tickSize(this.width - this.margin * 2)
		.tickFormat('');
	this.svg.append('g')
		.attr('class', 'grid')
		.attr('transform', `translate(${this.margin}, 0)`)
		.style('stroke-dasharray', '5 5')
		.call(this.grid);
	this.svg.select('.grid').select('path')
		.style('opacity', 0);

	this.svg.append('g')
		.attr('class', 'grid')
		.attr('transform', `translate(${this.margin}, ${this.margin})`)
		.style('stroke-dasharray', '5 5')
		.append('line')
			.attr('stroke', 'currentColor')
			.attr('x2', this.width - this.margin * 2);

	this.xAxis = d3.axisBottom(this.xScale)
		.ticks(d3.timeYear.every(5))
		.tickSizeOuter(0);
	this.svg.append('g')
		.attr('class', 'xAxis')
		.attr('transform', `translate(0, ${this.height - this.margin})`)
		.call(this.xAxis);
	this.svg.select('.xAxis').select('path')
		.attr('marker-end', 'url(#triangleBlack)');

	this.yAxis = d3.axisLeft(this.yScale)
		.tickFormat(function(d, i) {
			return d + 'ᵉ';
		});
	this.svg.append('g')
		.attr('class', 'yAxis')
		.attr('transform', `translate(${this.margin}, 0)`)
		.call(this.yAxis);

	this.yAxisAudience = d3.axisRight(this.yScaleAudience)
		.tickSizeOuter(0)
		.tickFormat(d3.format('.2~s'));
	this.svg.append('g')
		.attr('class', 'yAxis')
		.attr('id', 'audienceAxis')
		.attr('transform', `translate(${this.width - this.margin}, 0)`)
		.style('color', this.colorAudience)
		.style('opacity', 0)
		.call(this.yAxisAudience);
	this.svg.select('#audienceAxis').select('path')
		.attr('marker-end', 'url(#triangleBlue)');

}


ChartPopularity.prototype.createTooltip = function() {

	this.tooltip = d3.select(this.element).append('div')
	    .attr('class', 'tooltip')
	    .style('opacity', 0);

}


ChartPopularity.prototype.createLineAudience = function() {

	let that = this;

	this.line = d3.line()
    	.curve(d3.curveCatmullRom)
    	.y(function(d) {
    		return that.yScaleAudience(d.audience);
    	});

	this.area = d3.area()
    	.curve(d3.curveCatmullRom)
    	.y1(function(d) {
    		return that.yScaleAudience(d.audience);
    	})
    	.y0(that.yScaleAudience(0));

    this.lineAudience = this.svg.append('g')
    	.attr('id', 'audience')
    	.style('opacity', 0);

    this.lineAudience.append('path')
	    .attr('class', 'area')
	    .style('fill', that.colorAudienceArea)
	   	.style('opacity', 0.4);

	this.lineAudience.append('path')
	    .attr('class', 'line')
	    .style('stroke', that.colorAudience)
	    .style('stroke-width', 3)
	    .style('fill', 'none')
	    .style('opacity', 0.8);

}


ChartPopularity.prototype.createLegend = function() {

	this.svg.append('text')
		.attr('x', this.margin)
		.attr('y', this.margin - 25)
		.attr('text-anchor', 'middle')
		.style('font-style', 'italic')
		.text('Rang au box office');

	this.svg.append('text')
		.attr('x', this.width - this.margin)
		.attr('y', this.height - this.margin + 30)
		.attr('text-anchor', 'middle')
		.style('font-style', 'italic')
		.text('Année');

	this.legend = this.svg.append('g')
		.attr('class', 'legend')
		.style('opacity', 0);

	for (let i = 0; i < 2; i++) {

		this.legend.append('circle')
		.attr('cx', this.width/2 - 120 + 200*i)
		.attr('cy', this.margin - 40)
		.attr('r', 8)
		.attr('fill', (i == 0) ? this.colorWinner : this.colorNominee);

		this.legend.append('text')
			.attr('x', this.width/2 - 100 + 200*i)
			.attr('y', this.margin - 40)
			.attr('text-anchor', 'start')
			.attr('alignment-baseline', 'central')
			.text((i == 0) ? 'Films récompensés' : 'Films nommés');
	}

	this.legend.append('g')
		.attr('class', 'legend-audience')
		.style('opacity', 0);

	this.legend.select('.legend-audience').append('rect')
		.attr('x', this.width/2 + 250)
		.attr('y', this.margin - 40)
		.attr('width', 40)
		.attr('height', 3)
		.attr('fill', this.colorAudience);

	this.legend.select('.legend-audience').append('text')
		.attr('x', this.width/2 + 300)
		.attr('y', this.margin - 40)
		.attr('text-anchor', 'start')
		.attr('alignment-baseline', 'central')
		.text('Nombre de téléspectateurs pour la cérémonie');

}


ChartPopularity.prototype.update = function(category, specialAction) {

	let that = this;

	this.category = category;

	this.filteredData = this.data[this.data.findIndex(function(e) {
		return e.key == category;
	})].values;
	this.filteredData = this.removeUselessYears(this.filteredData, category);

	switch(specialAction) {

		case 'showNominees':
			this.updateAxes();
			this.updateCircles();
			this.circles.selectAll('circle')
				.attr('fill', this.colorNominee);
			break;

		case 'showWinners':
			this.circles.selectAll('circle')
				.transition()
				.duration(1000)
				.attr('fill', function(d) {
					return (d.winner) ? that.colorWinner : that.colorNominee;
				});
			this.legend
				.transition()
				.duration(1000)
				.style('opacity', 1);
			break;

		case 'showAudienceCeremony':
			this.filteredData = this.filteredData.filter(function(e) {
				return ((e.year >= new Date('1974')) && (e.year <= new Date('2018')));
			});
			this.xScale.domain([new Date('1974'), new Date('2018')]);
			this.svg.select('.xAxis')
				.transition()
				.duration(1000)
				.call(this.xAxis);

			this.legend.select('.legend-audience')
				.transition()
				.duration(1000)
				.style('opacity', 1);

			this.showAudience();

			this.updateCircles();

			this.addLinks();

			break;

		default:
			this.tooltipEnabled = true;
			this.lineAudience
				.transition()
				.duration(1000)
				.style('opacity', 0);
			this.svg.select('#audienceAxis')
				.transition()
				.duration(1000)
				.style('opacity', 0);
			this.updateAxes();
			this.updateCircles();
			this.addLinks();

			this.legend.select('.legend-audience')
				.transition()
				.duration(1000)
				.style('opacity', 0);
	}

}


ChartPopularity.prototype.updateAxes = function() {

	let that = this;

	this.xScale.domain([d3.min(this.filteredData, function(d) {
		return d.year;
	}), new Date('2019')]);

	this.svg.select('.grid')
		.transition()
		.duration(1000)
		.call(this.grid);

	this.svg.select('.xAxis')
		.transition()
		.duration(1000)
		.call(this.xAxis);

	this.yScale.domain([1, d3.max(this.filteredData, function(d) {
		return d.rank;
	})]);

	this.svg.select('.yAxis')
		.transition()
		.duration(1000)
		.call(this.yAxis);
	this.svg.select('.yAxis').append('g')
		.attr('class', 'tick')
		.attr('transform', `translate(0, ${this.margin})`)
		.append('line')
			.attr('x2', -6)
			.attr('stroke', 'currentColor');
	this.svg.select('.yAxis').select('.tick:last-child')
		.append('text')
			.attr('x', -9)
			.attr('fill', 'currentColor')
			.text('1ᵉʳ');

}


ChartPopularity.prototype.updateCircles = function() {

	let that = this;

	let circles = this.circles.selectAll('circle')
		.data(this.filteredData);

	circles.exit()
		.transition()
		.duration(1000)
		.style('opacity', 0)
	.remove();

	circles
		.transition()
		.duration(1000)
		.attr('id', function(d) {
			return that.getId(d.title);
		})
		.attr('fill', function(d) {
			return (d.winner) ? that.colorWinner : that.colorNominee;
		})
		.attr('stroke', function(d) {
			return (d.winner) ? that.colorWinner : that.colorNominee;
		})
		.attr('cx', function(d) {
			return that.xScale(d.year);
		})
		.attr('cy', function(d) {
			return that.yScale(d.rank);
		})
		.style('opacity', function(d) {
			return (d.winner) ? 1 : 0.6;
		});

	circles.enter().append('circle')
		.on('mouseover', function(d) {
			if (!that.tooltipEnabled) return null;
			let circle = d3.select(this);
			that.tooltip.html(that.getTooltip(d))
				.style('left', function() {
					return `${circle.node().getBoundingClientRect().x + circle.node().getBoundingClientRect().width / 2 - this.parentNode.getBoundingClientRect().x}px`;
				})
				.style('top', function() {
					return `${circle.node().getBoundingClientRect().y+ circle.node().getBoundingClientRect().height / 2  - this.parentNode.getBoundingClientRect().y}px`;
				})
			that.tooltip
				.transition()
				.duration(200)
				.style('opacity', .9)
		})
		.on('mouseout', function(d) {
			that.tooltip
				.transition()
				.duration(200)
				.style('opacity', 0)
		})
		.attr('id', function(d) {
			return that.getId(d.title);
		})
		.attr('fill', function(d) {
			return (d.winner) ? that.colorWinner : that.colorNominee;
		})
		.attr('cx', function(d) {
			return that.xScale(d.year);
		})
		.attr('cy', function(d) {
			return that.yScale(d.rank);
			})
		.attr('r', 8)
		.attr('stroke', function(d) {
			return (d.winner) ? that.colorWinner : that.colorNominee;
		})
		.attr('stroke-width', 0)
		.style('cursor', 'pointer')
		.style('opacity', 0)
			.transition()
			.duration(1000)
			.style('opacity', function(d) {
				return (d.winner) ? 1 : 0.6;
			});

}


ChartPopularity.prototype.addLinks = function() {

	let that = this;

	let movies = d3.selectAll('.movie-link').nodes()
	.filter(function(e) {
		let parentStep = e.parentNode;
		while (parentStep.tagName != 'DIV') {
			parentStep = parentStep.parentNode;
		}
		return d3.select(parentStep).classed('active');
	});

	[...movies].forEach(function(e) {
		e.addEventListener('mouseenter', function(event) {
			let title = event.currentTarget.getAttribute('data-title');
			if (title == undefined) title = event.currentTarget.textContent;
			let circle = d3.select(`#${that.getId(title)}`);
			circle
				.transition()
				.duration(200)
					.attr('stroke-width', 5)
					.attr('fill', '#242424')
					.attr('r', 15)
					.style('opacity', 1);
			that.circles.node().appendChild(circle.node());
		});
		e.addEventListener('mouseleave', function(event) {
			let title = event.currentTarget.getAttribute('data-title');
			if (title == undefined) title = event.currentTarget.textContent;
			let circle = d3.select(`#${that.getId(title)}`);
			circle
				.transition()
				.duration(200)
				.attr('stroke-width', 0)
				.attr('r', 8)
				.attr('fill', function(d) {
					return (d.winner) ? that.colorWinner : that.colorNominee;
				})
				.style('opacity', function(d) {
					return (d.winner) ? 1 : 0.6;
				});
		});
	});
}


ChartPopularity.prototype.showAudience = function(d) {

	let that = this;

	this.line
		.x(function(d) {
			return that.xScale(d.year);
		});

	this.area
    	.x(function(d) {
			return that.xScale(d.year);
		});

	this.lineAudience.select('.line')
		.attr('d', this.line(this.oscarsAudiences));

	this.lineAudience.select('.area')
		.attr('d', this.area(this.oscarsAudiences));

	this.lineAudience
		.transition()
		.duration(1000)
		.style('opacity', 1);

	this.svg.select('#audienceAxis')
		.transition()
		.duration(1000)
		.style('opacity', 1);

}


ChartPopularity.prototype.getTooltip = function(d) {

	let boxOffice = d.boxOffice;

	if (boxOffice >= 1e9) {
		boxOffice = `${d3.format('.1~f')(boxOffice / 1e9)} milliard $`;
	}
	else if (boxOffice >= 2e6) {
		boxOffice = `${d3.format('.1~f')(boxOffice / 1e6)} millions $`;
	}
	else if (boxOffice >= 1e6) {
		boxOffice = `${d3.format('.1~f')(boxOffice / 1e6)} million $`;
	}
	else {
		boxOffice = `${d3.format(',')(boxOffice)} $`;
	}

	return `
		<h3>${d.winner ? "<img src='./media/oscar.svg' width=20 style='display: inline-block; margin: 0' />" : ''} ${d.title}</h3>
		${d.rank}${(d.rank == 1) ? '<sup>er</sup>' : '<sup>e</sup>'} au box office
		<p>${boxOffice}</p>
		<p><i>${this.translate(d.genre1) + ((d.genre2) ? ', ' + this.translate(d.genre2) : '') + ((d.genre3) ? ', ' + this.translate(d.genre3) : '')}</i></p>
	`;

}


ChartPopularity.prototype.removeUselessYears = function(data, category) {
	return data.filter(function(e) {
		let start = 1929;
		switch(category) {
			case 'Best Picture':
				start = 1940;
				break;
	   		case 'Best Directing':
    			start = 1940;
				break;
    		case 'Best Cinematography':
       			start = 1940;
				break;
	   		case 'Best Original Screenplay':
    			start = 1960;
				break;
	    	case 'Best Adapted Screenplay':
	    		start = 1960;
				break;
	    	case 'Best Visual Effects':
	    		start = 1954;
		}
		return e.year.getFullYear() >= new Date(start);
	});
}


ChartPopularity.prototype.translate = function(genre) {
	let genres = ['Drama', 'Romance', 'Comedy', 'Biography', 'History', 'Adventure', 'Crime', 'Thriller', 'War', 'Action', 'Mystery', 'Family', 'Fantasy', 'Musical', 'Music', 'Western', 'Sport', 'Sci-Fi', 'Film-Noir', 'Animation', 'Horror'];
	let translations = ['Drame', 'Film romantique', 'Comédie', 'Biopic', 'Film historique', 'Aventure', 'Crime', 'Thriller', 'Film de guerre', 'Action', 'Mystère', 'Film familial', 'Fantastique', 'Comédie musicale', 'Film musical', 'Western', 'Sport', 'Science-fiction', 'Film noir', 'Animation', 'Horreur'];
	return translations[genres.indexOf(genre)];
}


ChartPopularity.prototype.getId = function(title) {
	return 'id-' + title.replace(/[ ,:?;!\.']/g, '-').replace(/-+/g, '-').toLowerCase();
}
