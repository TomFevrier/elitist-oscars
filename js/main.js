import { chartPopularity, chartEvolutionGenres, chartOscarsGenres } from './generateCharts.js';

window.onload = function() {

	const scroller = scrollama();

	scroller.setup({
		container: '.chartArea',
		graphic: '.chartContainer',
		text: '.comment',
		step: '.comment .step',
		offset: 0.6
	})
	.onStepEnter(handleStepEnter)
	.onStepExit(handleStepExit);

	// window.addEventListener('resize', function() {
	// 	scroller.resize();
	// });


	function handleStepEnter(response) {

		// d3.selectAll('.step').each(function() {
		// 	d3.select(this).classed('active', (this == response.element));
		// });

		d3.select(response.element).classed('active', true);

		const chart = eval(d3.select(response.element.parentNode.parentNode).select('.chart').attr('id'));
		let part = d3.select(response.element).attr('data-part');
		let specialAction = d3.select(response.element).attr('data-action');
		(part) ? chart.update(part, specialAction) : (typeof chart.addLinks == 'function') ? chart.addLinks() : null;
	}


	function handleStepExit(response) {
		d3.select(response.element).classed('active', false);
	}

}
