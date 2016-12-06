



var source = 0;	// current data source
var limit = 40;

// data sources
var sources = [
	{"name":"trans: drvlone (tracts)", "data": "16740_trans_drvlone_sample.csv","col1":"t_drvloneCV","col2":"t_drvloneE"},
	{"name":"trans: drvlone (regions)", "data": "16740_trans_drvlone_sample.csv","col1":"r_drvloneCV","col2":"r_drvloneE"},
	{"name":"trans: transit (tracts)", "data": "16740_trans_transit_sample.csv","col1":"t_transitCV","col2":"t_transitE"},
	{"name":"trans: transit (regions)", "data": "16740_trans_transit_sample.csv","col1":"r_transitCV","col2":"r_transitE"},
	{"name":"trans: vehiclpp (tracts)", "data": "16740_trans_vehiclpp_sample.csv","col1":"t_vehiclppCV","col2":"t_vehiclppE"},
	{"name":"trans: vehiclpp (regions)", "data": "16740_trans_vehiclpp_sample.csv","col1":"r_vehiclppCV","col2":"r_vehiclppE"},
	{"name":"hous: avgrooms (tracts)", "data": "16740_hous_avgrooms_sample.csv","col1":"t_avgroomsCV","col2":"t_avgroomsE"},
	{"name":"hous: avgrooms (regions)", "data": "16740_hous_avgrooms_sample.csv","col1":"r_avgroomsCV","col2":"r_avgroomsE"},
	{"name":"hous: occupied (tracts)", "data": "16740_hous_occupied_sample.csv","col1":"t_occupiedCV","col2":"t_occupiedE"},
	{"name":"hous: occupied (regions)", "data": "16740_hous_occupied_sample.csv","col1":"r_occupiedCV","col2":"r_occupiedE"}
];


function load_data(source,callback){
	d3.csv("../data/"+ sources[source].data, function(data){
		//console.log(data);
		data = remove_rows(data,"inf"); 	// remove rows with "inf" (infinity)
		data = data.slice(0,limit);			// confine to limit
		display_table(data,"table",40);		// display table
		//console.log(data);
		callback(data,sources[source].col1,sources[source].col2);
	});
}

// buttons for data sources
for (var i in sources){
	var html = '<p><button class="btn btn-sm" id="'+ i +'">'+ sources[i].name +'</button></p>'
	$(".sources").append(html);
	$("#"+ i ).on("mouseover",function(){
		source = this.id;
		load_data(source,update_data);
	})
}


/* 
 *	SCATTERPLOT PROPERTIES 
 */

var margin = { top: 20, right: 20, bottom: 50, left: 50 },
	width = 1000 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    radius = 8;

var svg = d3.select("#chart")
	.append("div")
		.classed("svg-container", true) //container class to make it responsive
	.append("svg")
		// responsive SVG needs these 2 attributes and no width and height attr
		.attr("preserveAspectRatio", "xMinYMin meet")
		.attr("viewBox", "0 0 "+ width +" "+ height)
		.classed("svg-content-responsive", true); // class to make it responsive

var g = svg.append("g");





var xAxisLabelText = "(tract CV) ",
	xAxisLabelOffset = 0;

var yAxisLabelText = "(tract estimate) ",
	yAxisLabelOffset = 30;		

// create div for the tooltip
var tooltip = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);




/**
 *	D3 SCATTERPLOT
 *	x: census estimate
 *	y: CV
 */
function update_data(data,xCol,yCol){
	//console.log(JSON.stringify(data));

	// set X min, max
	var xExtent = d3.extent(data, function(d){ return parseFloat(d[xCol]) });
	xExtent[0] = -.001; // tweak X axis to allow -0

	// scale xAxis data (domain/input) onto x range (output)
	var xScale = d3.scaleLinear()
		.domain(xExtent)
		.range([margin.left,width-margin.right]);

	// set Y min, max
	var yExtent = d3.extent(data, function(d){ return d[yCol] });

	// function to map Y data (input) onto Y range (output)
	var yScale = d3.scaleLinear()
		.domain(yExtent)
		.range([height-margin.bottom, margin.top]); // reverse so 0,0 is bottom,left


	// select circles
	g.selectAll("circle")
		.data(data).enter()
		.append("circle");

	g.selectAll("circle")
		.transition().duration(700)
			.attr("cx", function(d){ return xScale( parseFloat(d[xCol]) ) })
			.attr("cy", function(d){ return yScale( parseFloat(d[yCol]) ) })
			.attr("r", radius)
			.attr("class", "mark")
			.attr("id", function(d){ return "circle_"+ d[yCol] +"_"+ d[xCol] })
			.style("opacity", .9)
			.style("fill", function(d,i){ return colores_google(i) });	

	// add circle interaction
	g.selectAll("circle")
		// show tooltip
		.on("mouseover", function(d) {
			//console.log(d3.select(this).attr("id")); // log circle id
			tooltip.transition().duration(200)
				.style("opacity", .9);
			tooltip.html( yCol +": "+ d[yCol] +"<br>"+ xCol +": "+ d[xCol] )
				.style("left", (d3.event.pageX) + "px")
				.style("top", (d3.event.pageY - 40) + "px");
			d3.select(this).transition().style("opacity", .9);
		})
		// hide tooltip
		.on("mouseout", function(d) {
			tooltip.transition().duration(500).style("opacity", 0);
			d3.select(this).transition().style("opacity", .7);
		});


	create_scatterplot_axes(xScale,yScale,xCol,yCol);
}
load_data(0,update_data);





/* 
 *	CREATE AXES + LABELS 
 */
function create_scatterplot_axes(xScale,yScale,xCol,yCol){

	// set X/Y axes functions
	var xAxis = d3.axisBottom().scale(xScale);
	var yAxis = d3.axisLeft().scale(yScale);

	// add X axis properties and call above function
	d3.select("svg").append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + (height-margin.bottom) + ")");

	// add Y axis properties and call above function
	d3.select("svg").append("g")	
		.attr("class", "y axis")
		.attr("transform", "translate(" + (margin.left) + ",0)");

	// update X/Y axes
	d3.select(".x.axis").transition().duration(500).call(xAxis); 
	d3.select(".y.axis").transition().duration(500).call(yAxis); 

	// add X axis label
	svg.selectAll(".x.axis .label").remove();
	d3.select(".x.axis").append("text")
		.text(xAxisLabelText + xCol) 
        	.style("text-anchor", "middle")
			.attr("x", (width / 2))
			.attr("y", margin.bottom / 1.1)
			.attr("class", "label");

	// add Y axis label
	svg.selectAll(".y.axis .label").remove();
	d3.select(".y.axis").append("text")
		.text(yAxisLabelText + yCol) 
	        .style("text-anchor", "middle")
			.attr("class", "label")
			.attr("transform", "rotate (-90, -43, 0) translate(-280)");

}


