"use strict";





$(document).ready(function() {

	// current data source
	var source = 0;
	    
	// data sources
	var sources = [
		{"name":"drvlone", "data": "16740_trans_drvlone_sample.csv","col1":"t_drvloneCV","col2":"t_drvloneE"},
		{"name":"transit", "data": "16740_trans_transit_sample.csv","col1":"t_transitCV","col2":"t_transitE"},
		{"name":"vehiclpp", "data": "16740_trans_vehiclpp_sample.csv","col1":"t_vehiclppCV","col2":"t_vehiclppE"}
	];
	// buttons for data sources
	for (var i in sources){
		$(".sources").append(' <a href="#" id="'+ i +'">'+ sources[i].name +'</a>');
		$("#"+ i ).on("click",function(){
			load_csv("../data/"+ sources[this.id].data,parse);
			source = this.id;
		})
	}

	// load a csv file, parse is the callback function
	load_csv("../data/"+ sources[source].data, parse);

	create_graph();

	// parse and display data
	function parse(string){
		var data = d3.csvParse(string); // parse CSV with D3
		data = remove_rows(data,"inf"); // remove rows with "inf" (infinity)
		display_table(data,"table",20);	// display table
		update_graph(data,sources[source].col1,sources[source].col2,20); // display d3
	}

});




/* 
 *	PROPERTIES 
 */
var width = 1000, height = 500, 
	margin = { top: 20, right: 20, bottom: 50, left: 50 },
	minR = 8, maxR = 10; // radius

var xAxisLabelText = "(tract CV) ",
	xAxisLabelOffset = 0;

var yAxisLabelText = "(tract estimate) ",
	yAxisLabelOffset = 30;		

// create SVG
var svg = d3.select("#chart")
	.append("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("margin", margin.top);

function create_graph(){


}





/**
 *	D3 Scatterplot
 *	x: census estimate
 *	y: CV
 */

function update_graph(data,x_col,y_col,slice=10){

	if (slice) data = data.slice(0,slice); 	// only show a selection of the data 
	var keys = return_keys(data);			// get the keys to make labels, etc.


	/* 
	 *	CREATE VIZ 
	 */

	 // remove existing elements
	svg.selectAll("*").remove();
	
	// add circles
	svg.selectAll("circle") // select all circles that * will * exist
		.data(data) 		// for each data execute the following ...
			.enter()			// compare DOM to data, add elements as needed
			.append("circle"); 	// append circle element

	// set X min, max
	var x_extent = d3.extent(data, function(d){ return parseFloat(d[x_col]) });
	x_extent[0] = -.01; // tweak X axis to allow -0
	// function to map X data (input) onto X range (output)
	var x_scale = d3.scaleLinear()
		.range([margin.left,width-margin.right])
		.domain(x_extent);

	// set Y min, max
	var y_extent = d3.extent(data, function(d){ return d[y_col] });
	// function to map Y data (input) onto Y range (output)
	var y_scale = d3.scaleLinear()
		.range([height-margin.bottom, margin.top])
		.domain(y_extent);

	// add circles
	d3.selectAll("circle")
		.attr("cx", function(d){ return x_scale( parseFloat(d[x_col]) ) })
		.attr("cy", function(d){ return y_scale( parseFloat(d[y_col]) ) })	
		.attr("r", minR)
		.attr("class", "mark")
		.attr("id", function(d){ return "circle_"+ d[y_col] +"_"+ d[x_col] })
		.style("opacity", .0);

	// add an entry animation
	var enter_duration = 500; 
	d3.selectAll("circle")
		.transition()
		.delay(function(d, i) { return i / data.length * enter_duration; }) 
		.style("opacity", .9);

	// create div for the tooltip
	var tooltip = d3.select("body").append("div")	
	    .attr("class", "tooltip")				
	    .style("opacity", 0);

	// add circle interaction
	svg.selectAll("circle")	
		.on("mouseover", function(d) {
			//console.log(d3.select(this).attr("id")); // log circle id

			// change circle
			d3.select(this).transition()
				//.attr("r", maxR);
				.style("opacity", .9);
			// show tooltip
			tooltip.transition()
				.duration(200)
				.style("opacity", .9);
			tooltip.html( y_col +": "+ d[y_col] +"<br>"+ x_col +": "+ d[x_col] )
				.style("left", (d3.event.pageX) + "px")
				.style("top", (d3.event.pageY - 40) + "px");
		})
		.on("mouseout", function(d) {
			// hide tooltip
			tooltip.transition()
				.duration(500)
				.style("opacity", 0);
			// change circle	
			d3.select(this).transition()
				//.attr("r", minR);
				.style("opacity", .7);
		});




	/* 
	 *	CREATE AXES + LABELS 
	 */

	// set x,y axes functions
	var x_axis = d3.axisBottom().scale(x_scale);
	var y_axis = d3.axisLeft().scale(y_scale);

	// add X axis properties and call above function
	d3.select("svg").append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + (height-margin.bottom) + ")")
		.call(x_axis);

	// add X axis label
	d3.select(".x.axis").append("text")
		.text(xAxisLabelText+ x_col) 
        .style("text-anchor", "middle")
		.attr("x", (width / 2))
		.attr("y", margin.bottom / 1.1)
		.attr("class", "label");

	// add Y axis properties and call above function
	d3.select("svg")
		.append("g")	
			.attr("class", "y axis")
			.attr("transform", "translate(" + (margin.left) + ",0)")
		.call(y_axis);

	// add Y axis label
	d3.select(".y.axis").append("text")
		.text(yAxisLabelText + y_col) 
        .style("text-anchor", "middle")
		//.attr("x", (width / 2))
		//.attr("y", margin.bottom / 1.1)
		.attr("class", "label")
		.attr("transform", "rotate (-90, -43, 0) translate(-280)");





}








/* FIRST ONE, mostly works

function draw3(data){



	// define variables
	var outerWidth = 1150,
		outerHeight = 500,
		margin = { left: -20, top: 20, right: 20, bottom: -20 },
		rMin = 10, // "r" = radius
		rMax = 10,
		strokeWeight = 0.1,
		xColumn = "t_drvloneCV",
		yColumn = "t_drvloneE",
		rColumn = "t_drvloneE",
		colorColumn = "t_drvloneCV";

	xColumn = "sepal_length";
	yColumn = "petal_length";
	rColumn = "sepal_width";
	colorColumn = "species";

	var innerWidth  = outerWidth  - margin.left - margin.right,
		innerHeight = outerHeight - margin.top  - margin.bottom;

	// create SVG
	var svg = d3.select("#chart")
		.append("svg")
			.attr("width", outerWidth)
			.attr("height", outerHeight),
		g = svg.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// normalize data  
	var xScale = d3.scaleLinear().range([0, innerWidth]),
		yScale = d3.scaleLinear().range([innerHeight, 0]),
		rScale = d3.scaleLinear().range([rMin, rMax]),
		colorScale = d3.scaleOrdinal().range(d3.schemeDark2);

	var xAxis = d3.axisBottom()
			.scale(xScale),
		yAxis = d3.axisLeft()
			.scale(yScale)
			.ticks(5);


	xScale.domain(d3.extent(data, function (d){ return d[xColumn]; }));
	yScale.domain(d3.extent(data, function (d){ return d[yColumn]; }));
	rScale.domain(d3.extent(data, function (d){ return d[rColumn]; }));

	var circles = g.selectAll("circle")
		.data(data);
	circles.exit().remove();
	circles.enter()
		.append("circle")
			.attr("class", "mark")
		.merge(circles)
			.attr("cx", function (d){ return xScale(d[xColumn]); })
			.attr("cy", function (d){ return yScale(d[yColumn]); })
			.attr("r",  function (d){ return rScale(d[rColumn]); })
			.attr("stroke-width", function (d){
				return rScale(d[rColumn]) * strokeWeight;
			})
			.attr("color", function (d){ return colorScale(d[colorColumn]); });
}

function type(d){
	d.sepal_length = +d.sepal_length;
	d.sepal_width  = +d.sepal_width;
	d.petal_length = +d.petal_length;
	d.petal_width  = +d.petal_width;
	return d;
}

//d3.csv("../data/iris.csv", type, draw3);

*/



