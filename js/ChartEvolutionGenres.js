export default class ChartEvolutionGenres {

	constructor(options) {

		let that = this;

		this.originalOscarsData = d3.nest()
			.key(function(d) {
				return d.year.getFullYear();
			})
			.entries(options.oscarsData);

		options.audiencesData.forEach(function(e) {
			e.year = new Date(e.year);
			e.year.setFullYear(e.year.getFullYear() + 1);
		});
		this.originalAudiencesData = d3.nest()
			.key(function(d) {
				return d.year.getFullYear();
			})
			.entries(options.audiencesData);

		let oscarsData = [];
		options.oscarsData.forEach(function(e) {
			oscarsData.push({
				year: e.year,
				title: e.title,
				genre: e.genre1,
				category: e.category,
				winner: e.winner
			});
			if (e.genre2 != '') {
				oscarsData.push({
					year: e.year,
					title: e.title,
					genre: e.genre2,
					category: e.category,
					winner: e.winner
				});
			}
			if (e.genre3 != '') {
				oscarsData.push({
					year: e.year,
					title: e.title,
					genre: e.genre3,
					category: e.category,
					winner: e.winner
				});
			}
		});
		this.oscarsData = d3.nest()
			.key(function(d) {
				return d.year.getFullYear();
			})
			.key(function(d) {
				return d.genre;
			})
			.rollup(function(v) {
				return {
					frequency: v.length / that.originalOscarsData.find(function(e) {
						return e.key == v[0].year.getFullYear().toString();
					}).values.length,
					examples: v.map(function(e) {
						return e.title;
					})
					.filter(function(e, i, array) {
						return array.indexOf(e) == i;
					})
				};
			})
			.entries(oscarsData)
			.filter(function(e) {
				return new Date(e.key) >= new Date('1940');
			})
			.sort(function(a, b) {
				return new Date(a.key) - new Date(b.key);
			});

		let audiencesData = [];
		options.audiencesData.forEach(function(e) {
			let year = e.year;
			audiencesData.push({
				year: year,
				title: e.title,
				genre: e.genre1
			});
			if (e.genre2 != '') {
				audiencesData.push({
					year: year,
					title: e.title,
					genre: e.genre2
				});
			}
			if (e.genre3 != '') {
				audiencesData.push({
					year: year,
					title: e.title,
					genre: e.genre3
				});
			}
		});
		this.audiencesData = d3.nest()
			.key(function(d) {
				return d.year.getFullYear();
			})
			.key(function(d) {
				return d.genre;
			})
			.rollup(function(v) {
				return {
					frequency: v.length / that.originalAudiencesData.find(function(e) {
						return e.key == v[0].year.getFullYear().toString();
					}).values.length,
					examples: v.map(function(e) {
						return e.title;
					})
					.filter(function(e, i, array) {
						return array.indexOf(e) == i;
					})
				};
			})
			.entries(audiencesData)
			.filter(function(e) {
				return ((new Date(e.key) >= new Date('1940')) && (new Date(e.key) <= new Date('2020')));
			})
			.sort(function(a, b) {
				return new Date(a.key) - new Date(b.key);
			});

		this.combinedData = this.oscarsData.map(function(e, i) {
	    	return {
	    		oscarsData: e,
	    		audiencesData: that.audiencesData[i]
	    	}
	    });

		this.colorWinner = options.colors.colorWinner;
		this.colorNominee = options.colors.colorNominee;
		this.colorAudience = options.colors.colorAudience;
		this.colorAudienceArea = options.colors.colorAudienceArea;

		this.tooltipEnabled = false;

		this.element = options.element;

		this.draw();
	}

}


ChartEvolutionGenres.prototype.draw = function() {

	this.width = 1000;
	this.height = 600;
	this.margin = 50;

	this.createSVG();
	this.createScales();
	this.createAxes();
	this.createTooltip();

	this.createCurves();

	this.createLegend();

}


ChartEvolutionGenres.prototype.createSVG = function() {

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


ChartEvolutionGenres.prototype.createScales = function() {

	this.xScale = d3.scaleBand()
		.padding(0)
		.domain(this.oscarsData.map(function(e) {
			return e.key;
		}).sort())
		.rangeRound([this.margin, this.width - this.margin]);

	this.yScale = d3.scaleLinear()
		.domain([0, 1])
		.rangeRound([this.height - this.margin, this.margin]);

}


ChartEvolutionGenres.prototype.createAxes = function() {

	this.grid = d3.axisRight(this.yScale)
		.tickSize(this.width - this.margin * 2)
		.tickSizeOuter(0)
		.tickFormat('');
	this.svg.append('g')
		.attr('class', 'grid')
		.attr('transform', `translate(${this.margin}, 0)`)
		.style('stroke-dasharray', '5 5')
		.call(this.grid);
	this.svg.select('.grid').select('path')
		.style('opacity', 0);

	this.xAxis = d3.axisBottom(this.xScale)
		.tickSize(0)
		.tickValues(this.xScale.domain().filter(function(e, i){
			return !(i % 4);
		}));
	this.svg.append('g')
		.attr('class', 'xAxis')
		.attr('transform', `translate(0, ${this.height - this.margin})`)
		.call(this.xAxis);
	this.svg.select('.xAxis').select('path')
		.attr('marker-end', 'url(#triangle)');
	this.svg.select('.xAxis').selectAll('.tick').each(function() {
		d3.select(this).select('text').attr('y', 8)
	});

	this.yAxis = d3.axisLeft(this.yScale)
		.tickSizeOuter(0)
		.tickFormat(d3.format('.0%'));
	this.svg.append('g')
		.attr('class', 'yAxis')
		.attr('transform', `translate(${this.margin}, 0)`)
		.call(this.yAxis);

}


ChartEvolutionGenres.prototype.createTooltip = function() {

	this.tooltip = d3.select(d3.select(this.element).node().parentNode).append('div')
	    .attr('class', 'tooltip')
	    .style('opacity', 0);

}


ChartEvolutionGenres.prototype.createCurves = function() {

	let that = this;

	this.line = d3.line()
    	.curve(d3.curveStepAfter)
    	.x(function(d) {
    		return that.xScale(d.key);
    	})
    	.y(function(d) {
			let element = d.values.find(function(e) {
	    		return e.key == 'Drama';
	    	});
	    	return that.yScale(element ? element.value.frequency : 0);
	    });

	let lastPointOscarsY = this.oscarsData[this.oscarsData.length - 1].values.find(function(e) {
		return e.key == 'Drama';
	});
	let lastPointOscars = {
		x: this.xScale(this.oscarsData[this.oscarsData.length - 1].key) + this.xScale.bandwidth(),
		y: this.yScale(lastPointOscarsY ? lastPointOscarsY.value.frequency : 0)
	};

	let lastPointAudiencesY = this.audiencesData[this.audiencesData.length - 1].values.find(function(e) {
		return e.key == 'Drama';
	});
	let lastPointAudiences = {
		x: this.xScale(this.audiencesData[this.audiencesData.length - 1].key) + this.xScale.bandwidth(),
		y: this.yScale(lastPointAudiencesY ? lastPointAudiencesY.value.frequency : 0)
	};

    this.curveOscars = this.svg.append('path')
    	.attr('d', this.line(this.oscarsData) + `L${lastPointOscars.x},${lastPointOscars.y}`)
    	.attr('class', 'line')
    	.style('stroke', that.colorWinner)
    	.style('stroke-width', 3)
    	.style('fill', 'none');

    let curveOscarsLength = this.curveOscars.node().getTotalLength();

    this.curveOscars
    	.attr('stroke-dasharray', `${curveOscarsLength} ${curveOscarsLength}`)
		.attr('stroke-dashoffset', curveOscarsLength);

    this.curveAudiences = this.svg.append('path')
    	.attr('d',this.line(this.audiencesData) + `L${lastPointAudiences.x},${lastPointAudiences.y}`)
    	.attr('class', 'line')
    	.style('stroke', that.colorAudience)
    	.style('stroke-width', 3)
    	.style('fill', 'none');

    let curveAudiencesLength = this.curveAudiences.node().getTotalLength();

    this.curveAudiences
    	.attr('stroke-dasharray', `${curveAudiencesLength} ${curveAudiencesLength}`)
		.attr('stroke-dashoffset', curveAudiencesLength);

    this.area = this.svg.append('g').selectAll('rect')
    	.data(this.combinedData)
    	.enter().append('rect')
    		.on('mouseover', function(d) {
    				if (!that.tooltipEnabled) return null;
					that.tooltip.html(that.getTooltip(d))
						.style('left', function() {
							return `${d3.mouse(this.parentNode)[0]}px`;
						})
						.style('top', function() {
							return `${d3.mouse(this.parentNode)[1]}px`;
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
	    	.attr('fill', function(d) {
				let oscarsData = d.oscarsData.values.find(function(e) {
			   		return e.key == 'Drama';
			   	});
			   	oscarsData = (oscarsData) ? oscarsData.value.frequency : 0;

			    let audiencesData = d.audiencesData.values.find(function(e) {
			    	return e.key == 'Drama';
			    });
			    audiencesData = (audiencesData) ? audiencesData.value.frequency : 0;

			    return (oscarsData > audiencesData) ? that.colorNominee : that.colorAudienceArea;
			})
			.attr('x', function(d) {
	    		return that.xScale(d.oscarsData.key);
	    	})
	    	.attr('y', function(d) {
	    		let oscarsData = d.oscarsData.values.find(function(e) {
			   		return e.key == 'Drama';
			   	});
			   	oscarsData = (oscarsData) ? oscarsData.value.frequency : 0;

			    let audiencesData = d.audiencesData.values.find(function(e) {
			    	return e.key == 'Drama';
			    });
			    audiencesData = (audiencesData) ? audiencesData.value.frequency : 0;

	    		return that.yScale(Math.max(oscarsData, audiencesData));
	    	})
	    	.attr('width', this.xScale.bandwidth())
	    	.attr('height', function(d) {
	    		let oscarsData = d.oscarsData.values.find(function(e) {
		    		return e.key == 'Drama';
		    	});
		    	oscarsData = (oscarsData) ? oscarsData.value.frequency : 0;

		    	let audiencesData = d.audiencesData.values.find(function(e) {
			    	return e.key == 'Drama';
			    });
			    audiencesData = (audiencesData) ? audiencesData.value.frequency : 0;
	    		return that.yScale(Math.min(oscarsData, audiencesData)) - that.yScale(Math.max(oscarsData, audiencesData));
	    	})
	    	.style('opacity', 0)
	    	.style('cursor', 'pointer');

}


ChartEvolutionGenres.prototype.createLegend = function() {

	this.svg.append('text')
		.attr('x', this.margin)
		.attr('y', this.margin - 25)
		.attr('text-anchor', 'middle')
		.style('font-style', 'italic')
		.text('Fréquence');

	this.svg.append('text')
		.attr('x', this.width - this.margin + 10)
		.attr('y', this.height - this.margin + 30)
		.attr('text-anchor', 'end')
		.style('font-style', 'italic')
		.text('Année');

	this.legend = this.svg.append('g')
		.attr('class', 'legend')
		.style('opacity', 0);

	for (let i = 0; i < 2; i++) {
		this.legend.append('rect')
			.attr('x', this.width/2 - 180 + 300*i)
			.attr('y', this.margin - 30)
			.attr('width', 40)
			.attr('height', 3)
			.attr('fill', (i == 0) ? this.colorWinner : this.colorAudience);

		this.legend.append('text')
			.attr('x', this.width/2 - 130 + 300*i)
			.attr('y', this.margin - 30)
			.attr('text-anchor', 'start')
			.attr('alignment-baseline', 'central')
			.text((i == 0) ? 'Films nommés aux Oscars' : 'Films du top 20 au box office');
	}

}


ChartEvolutionGenres.prototype.update = function(genre, specialAction) {

	this.genre = genre;

	switch(specialAction) {

		case 'showOscars':
			this.curveOscars
				.transition()
		        .duration(3000)
	        	.attr('stroke-dashoffset', 0);
	        break;

		case 'showAudiences':
			this.legend
				.transition()
				.duration(1000)
				.style('opacity', 1);
			this.curveAudiences
				.transition()
		        .duration(3000)
	        	.attr('stroke-dashoffset', 0);
			break;

		case 'showDifference':
			this.tooltipEnabled = true;
			this.curveOscars
				.attr('stroke-dasharray', 'none');
			this.curveAudiences
	    		.attr('stroke-dasharray', 'none');
			this.area
				.transition()
				.duration(1000)
				.style('opacity', 0.4);
			break;

		default:
			this.updateAxis();
			this.updateCurves();
			this.updateDifference();
	}

}


ChartEvolutionGenres.prototype.updateAxis = function() {

	let that = this;

	this.yScale.domain([0, Math.max(
		d3.max(this.oscarsData, function(d) {
			let element = d.values.find(function(e) {
				return e.key == that.genre;
			});
			return element ? element.value.frequency : 0;
		}),
		d3.max(this.audiencesData, function(d) {
			let element = d.values.find(function(e) {
				return e.key == that.genre;
			});
			return element ? element.value.frequency : 0;
		})
	)]);

	this.svg.select('.grid')
		.transition()
		.duration(1000)
		.call(this.grid);

	this.svg.select('.yAxis')
		.transition()
		.duration(1000)
		.call(this.yAxis);
}


ChartEvolutionGenres.prototype.updateCurves = function() {

	let that = this;

	this.line
		.y(function(d) {
			let element = d.values.find(function(e) {
	    		return e.key == that.genre;
	    	});
	    	return that.yScale(element ? element.value.frequency : 0);
	    });

	let lastPointOscarsY = this.oscarsData[this.oscarsData.length - 1].values.find(function(e) {
		return e.key == that.genre;
	});
	let lastPointOscars = {
		x: this.xScale(this.oscarsData[this.oscarsData.length - 1].key) + this.xScale.bandwidth(),
		y: this.yScale(lastPointOscarsY ? lastPointOscarsY.value.frequency : 0)
	};

	let lastPointAudiencesY = this.audiencesData[this.audiencesData.length - 1].values.find(function(e) {
		return e.key == that.genre;
	});
	let lastPointAudiences = {
		x: this.xScale(this.audiencesData[this.audiencesData.length - 1].key) + this.xScale.bandwidth(),
		y: this.yScale(lastPointAudiencesY ? lastPointAudiencesY.value.frequency : 0)
	};

    this.curveOscars
    	.transition()
    	.duration(1000)
    	.attr('d', this.line(this.oscarsData) + `L${lastPointOscars.x},${lastPointOscars.y}`);

    this.curveAudiences
    	.transition()
    	.duration(1000)
    	.attr('d',this.line(this.audiencesData) + `L${lastPointAudiences.x},${lastPointAudiences.y}`);

}

ChartEvolutionGenres.prototype.updateDifference = function() {

	let that = this;

	this.area
		.transition()
		.duration(1000)
		.attr('fill', function(d) {
			let oscarsData = d.oscarsData.values.find(function(e) {
		   		return e.key == that.genre;
		   	});
		   	oscarsData = (oscarsData) ? oscarsData.value.frequency : 0;

		    let audiencesData = d.audiencesData.values.find(function(e) {
		    	return e.key == that.genre;
		    });
		    audiencesData = (audiencesData) ? audiencesData.value.frequency : 0;

		    return (oscarsData > audiencesData) ? that.colorNominee : that.colorAudienceArea;
		})
    	.attr('y', function(d) {
    		let oscarsData = d.oscarsData.values.find(function(e) {
		   		return e.key == that.genre;
		   	});
		   	oscarsData = (oscarsData) ? oscarsData.value.frequency : 0;

		    let audiencesData = d.audiencesData.values.find(function(e) {
		    	return e.key == that.genre;
		    });
		    audiencesData = (audiencesData) ? audiencesData.value.frequency : 0;

    		return that.yScale(Math.max(oscarsData, audiencesData));
    	})
    	.attr('height', function(d) {
    		let oscarsData = d.oscarsData.values.find(function(e) {
	    		return e.key == that.genre;
	    	});
	    	oscarsData = (oscarsData) ? oscarsData.value.frequency : 0;

	    	let audiencesData = d.audiencesData.values.find(function(e) {
		    	return e.key == that.genre;
		    });
		    audiencesData = (audiencesData) ? audiencesData.value.frequency : 0;
    		return that.yScale(Math.min(oscarsData, audiencesData)) - that.yScale(Math.max(oscarsData, audiencesData));
    	})

}


ChartEvolutionGenres.prototype.getTooltip = function(d) {

	let that = this;

	let oscarsData = d.oscarsData.values.find(function(e) {
		return e.key == that.genre;
	});

	oscarsData = (oscarsData) ? oscarsData.value : {frequency: 0, examples: []};

	let audiencesData = d.audiencesData.values.find(function(e) {
		return e.key == that.genre;
	});

	audiencesData = (audiencesData) ? audiencesData.value : {frequency: 0, examples: []};

	let oscarsExamples = `<i>${oscarsData.examples.slice(0, 3).join(', ')}${(oscarsData.examples.length > 3) ? '...' : ''}</i>`;
	let audiencesExamples = `<i>${audiencesData.examples.slice(0, 3).join(', ')}${(audiencesData.examples.length > 3) ? '...' : ''}</i>`;

	return `
		<h3>${d.oscarsData.key}</h3>
		<p style='margin-top:5px;'><img src='./media/oscar.svg' width=20 style='display: inline-block; margin: 0' /> <b>${(oscarsData.frequency != 0) ? d3.format('.1~%')(oscarsData.frequency) : "Aucun film"}</b></p>
		<p>${(oscarsData.examples.length) > 0 ? oscarsExamples : ''}</p>
		<p style='margin-top:5px;'><img src='./media/boxoffice.svg' width=17 style='display: inline-block; margin: 0' /> <b>${(audiencesData.frequency != 0) ? d3.format('.1~%')(audiencesData.frequency) : "Aucun film"}</b></p>
		<p>${(audiencesData.examples.length) > 0 ? audiencesExamples : ''}</p>
	`;

}
