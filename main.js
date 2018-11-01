d3.csv('data.csv', function(d) {
	return {
		director: d.director,
		title: d.title,
		year: new Date(d.year),
		rating: +d.rating,
		boxOffice: +d.boxOffice,
	};
}).then(draw);

function draw(data) {

	// Nesting and sorting data

	var nested = d3.nest()
		.key(function(d) { return d.director; })
		.entries(data);
		

	nested.forEach(function(filmography) {
		filmography.values = filmography.values.sort(function(a, b) {
	    	return a.year - b.year;
		});
	});

	
	// Sorting data so that the little circles are drawn after the large ones

	data = data.sort(function(a, b) {
		return b.boxOffice - a.boxOffice;
	});

	console.log(nested);


	// Chart specifications

	var margin = 100,
		marginBottom = 300
		width = 2000 - margin,
		height = 1000 - margin;

	var xScale = d3.scaleTime()
		.domain(d3.extent(data, function(d) {
			return d.year;
		}))
		.rangeRound([margin, width]);

	var yScale = d3.scaleLinear()
		.domain(d3.extent(data, function(d) {
			return d.rating;
		}))
		.rangeRound([height - marginBottom, margin]);

	var sizeScale = d3.scaleSqrt()
		.domain(d3.extent(data, function(d) {
			return d.boxOffice;
		}))
		.rangeRound([5, 40]);

	var color = function(director) {
		switch(director) {
			case 'Steven Spielberg':
				return '#3C0064';
				break;
			case 'Christopher Nolan':
				return '#144C80';
				break;
			case 'Lilly & Lana Wachowski':
				return '#F80060';
				break;
			case 'Quentin Tarantino':
				return '#F8E600';
				break;
			case 'Stanley Kubrick':
				return '#EC4600';
				break;
			case 'Michael Bay':
				return '#DA0000';
				break;
			case 'Peter Jackson':
				return '#004F14';
				break;
			case 'Ridley Scott':
				return '#424242';
				break;
			case 'Guillermo del Toro':
				return '#007850';
				break;
		}
	}

	var xAxis = d3.axisBottom(xScale);
	var yAxis = d3.axisLeft(yScale);

	var boxOfficeFormat = d3.format(',');

	var line = d3.line()
		.curve(d3.curveCatmullRom)
    	.x(function(d) { return xScale(d.year); })
    	.y(function(d) { return yScale(d.rating); });
    	
    	const mainDirectors = ['Steven Spielberg', 'Christopher Nolan', 'Stanley Kubrick', 'Quentin Tarantino'];


	// Creating the chart

	var svg = d3.select('body')
		.append('svg')
			.attr('viewBox', '0 0 ' + (width + margin) + ' ' + (height + margin))
			.attr('preserveAspectRatio', 'xMidYMid slice')
		 .append('g')
			.attr('class', 'chart');

	svg.append('g')
		.attr('class', 'x-axis')
		.attr('transform', 'translate(0, ' + (height - marginBottom)  + ')')
		.call(xAxis
			.ticks(d3.timeYear.every(2))
		);

	svg.append('g')
		.attr('class', 'y-axis')
		.attr('transform', 'translate(' + margin + ', 0)')
		.call(yAxis);

	// Lines
	d3.select('svg').selectAll('.line')
		.data(nested)
		.enter()
		.append('path')
			.attr('class', 'line')
			.attr('class', function(d) {
				return nameToId(d.key);
			})
			.attr('fill', 'none')
			.attr('stroke', function(d) {
				return color(d.key);
			})
			.attr('stroke-width', 5)
			.attr('d', function(d) {
				return line(d.values);
			})
			.style('opacity', 0);

	// Average lines
	d3.select('svg').selectAll('.average-line')
		.data(nested)
		.enter()
		.append('line')
			.attr('class', 'average-line')
			.attr('class', function(d) {
				return nameToId(d.key);
			})
			.attr('fill', 'none')
			.attr('stroke', function(d) {
				return color(d.key);
			})
			.attr('stroke-width', 2)
			.attr('x1', xScale(d3.min(data, function(d) { return d.year; })))
			.attr('y1', function(d) {
				return yScale(d3.mean(d.values, function(d) { return d.rating; }));
			})
			.attr('x2', xScale(d3.max(data, function(d) { return d.year; })))
			.attr('y2', function(d) {
				return yScale(d3.mean(d.values, function(d) { return d.rating; }));
			})
			.style('stroke-dasharray', ('3, 3'))
			.style('opacity', 0);


	var tooltip = d3.select('body').append('div')
    	.attr('class', 'tooltip')
    	.style('opacity', 0);

	// Circles
	var circles = d3.select('svg').selectAll('circle').data(data);
	circles.enter()
		.append('circle')
		.on('mouseover', function(d) {
			if (d3.selectAll('.film-' + nameToId(d.director)).attr('data-active') == 'true') {
				d3.select(this).style('cursor', 'pointer');
				d3.select('svg').selectAll('.' + nameToId(d.director))
					.transition()
					.duration(200)
					.style('opacity', 0.5);
				tooltip.transition()
					.duration(200)
					.style('opacity', .9);
				tooltip.html(function() {
					
					return '<h3>' + d.title.toUpperCase() + ' (' + d.year.getFullYear() + ')</h3>' +
					d.rating + '/10 &emsp; $' +  boxOfficeFormat(d.boxOffice);
				})
					
					.style('left', (d3.event.pageX) + 'px')
					.style('top', (d3.event.pageY - 28) + 'px')
					.style('width', (d.title.length + 1) * 20);
					//.style('background-color', color(d.director));
			}
		})
		.on('mouseout', function(d) {
			d3.select(this).style('cursor', 'default');
			d3.select('svg').selectAll('.' + nameToId(d.director))
				.transition()
				.duration(500)
				.style('opacity', 0);
			tooltip.transition()
				.duration(500)
				.style('opacity', 0);
		})
		.attr('class', function(d) {
			return 'film-' + nameToId(d.director)
		})
		.attr('data-active', function(d) {
			return mainDirectors.includes(d.director);
		})
		.attr('fill', function(d) {
			return color(d.director);
		})
		.attr('cx', function(d) {
			return xScale(d.year);
		})
		.attr('cy', function(d) {
			return yScale(d.rating);
		})
		.attr('r', function(d) {
			return sizeScale(d.boxOffice);
		})
		.style('opacity', function(d) {
			return (mainDirectors.includes(d.director)) ? 1 : 0;
		});
	circles.exit().remove();


	// Legend
	nested.forEach(function(d, i) {
	
		var group = d3.select('svg').append('g');
		
		group.append('title')
			.text(d.key)
			.attr('class', 'legend-director');

		group.append('circle')
			.attr('fill', color(d.key))
			.attr('cx', margin + i * 120)
			.attr('cy', height - margin)
			.attr('r', 50)

		group.append('svg:image')
			.attr('x', margin + i * 120 - 40)
			.attr('y', height - margin - 40)
			.attr('width', 80)
			.attr('height', 80)
			.attr('xlink:href', 'images/' + d.key + '.png')
			.style('opacity', (mainDirectors.includes(d.key)) ? 1 : 0.5)
			.on('mouseover', function() {
				d3.select(this).style('cursor', 'pointer');
				if (d3.selectAll('.film-' + nameToId(d.key)).attr('data-active') == 'true') {
					d3.select('svg').selectAll('.' + nameToId(d.key))
						.transition()
						.duration(200)
						.style('opacity', 0.5);
				}
			})
			.on('mouseout', function() {
				d3.select(this).style('cursor', 'default');
				d3.select('svg').selectAll('.' + nameToId(d.key))
					.transition()
					.duration(500)
					.style('opacity', 0);
			})
			.on('click', function() {
				let circles = d3.selectAll('.film-' + nameToId(d.key));
				console.log(circles.attr('data-active'));
				let active = circles.attr('data-active');
				let newOpacity = (active == 'true') ? 0 : 1;
				let newOpacityDirector = (active == 'true') ? 0.5 : 1;
				circles.attr('data-active', (active == 'true') ? 'false' : 'true');
				circles.transition()
					.duration(200)
					.style('opacity', newOpacity);
				d3.select('svg').selectAll('.' + nameToId(d.key))
					.transition()
					.duration(200)
					.style('opacity', newOpacity);
				d3.select(this).transition()
					.duration(200)
					.style('opacity', newOpacityDirector)
			});


	});

}


function nameToId(name) {
	return name.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and');
}
