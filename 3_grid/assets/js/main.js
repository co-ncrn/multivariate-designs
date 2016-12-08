



var source = 0;	// current data source
var limit = 108;

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
    boxW = 50, boxH = 50;

var svg = d3.select("#chart")
	.append("div")
		.classed("svg-container", true) //container class to make it responsive
	.append("svg")
		// responsive SVG needs these 2 attributes and no width and height attr
		.attr("preserveAspectRatio", "xMinYMin meet")
		.attr("viewBox", "0 0 "+ width +" "+ height)
		.classed("svg-content-responsive", true); // class to make it responsive

var g = svg.append("g");

// create div for the tooltip
var tooltip = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);




var sq = [18,10];
var str = "";

// create grid
function create_grid(data){

	for (var i in data){

		if (i % sq[0] == 0) {
			str += "\ncol "+ i;
		} else if (i > 0 && i % sq[0] !== 0) {
			str += "\t col "+ i +"\t";
		}
	}
	//console.log(str);
}
//create_grid(data);








/**
 *	D3 SCATTERPLOT
 *	x: census estimate
 *	y: CV
 */
function update_data(data,xCol,yCol){
	//console.log(JSON.stringify(data));


	// data fixing
	data.forEach(function(row,i) {
		//console.log(row);

		// the x column is the margin of error
		// so we create a high / low
		data[i].min = parseFloat(row[yCol]) - parseFloat(row[xCol]);
		data[i].max = parseFloat(row[yCol]) + parseFloat(row[xCol]);

		// clean numbers
		data[i][xCol] = Math.round(data[i][xCol] * 1000) / 1000;
		data[i][yCol] = Math.round(data[i][yCol] * 1000) / 1000;
	});
	//console.log(data)



	// set X min, max
	var xExtent = d3.extent(data, function(d){ return parseFloat(d[xCol]) });
	xExtent[0] = -.001; // tweak X axis to allow -0
console.log(xExtent)
	// scale xAxis data (domain/input) onto x range (output)
	var xScale = d3.scaleLinear()
		.domain([0,width])
		.range([margin.left,width-margin.right]);

	// set Y min, max
	var yExtent = d3.extent(data, function(d){ return d[yCol] });

	// function to map Y data (input) onto Y range (output)
	var yScale = d3.scaleLinear()
		.domain(yExtent)
		.range([0,1]); // reverse so 0,0 is bottom,left
console.log("yExtent: "+yExtent);
console.log(yScale(0),yScale(1));

var col = row = 0;


	// select points
	var box = g.selectAll("rect.box")
		.data(data).enter()
		.append("rect");

	g.selectAll("rect")
			.attr("class", "box")
		.transition().duration(600)
			.attr("x", function(d,i){ 
				if (i % sq[0] ===0 ) col = 0;
				else col++;
				return col*boxW;
			})
			.attr("y", function(d,i){ 

				if (i % sq[0] === 0 ) row++;
				return row*boxH;
			})
			.attr("width", boxW)
			.attr("height", boxH)
			.attr("id", function(d,i){ return d[xCol]*4; })
			.style("opacity", function(d,i){ return yScale(d[yCol]); }) // change color w/opacity
			.style("fill", "black");	

	// add interaction: show/hide tooltip
	g.selectAll("rect.box")
		.on("mouseover", function(d) {
			//console.log(d3.select(this).attr("id")); // log id
			tooltip.transition().duration(200).style("opacity", .9); // show tooltip
			var text = yCol +": "+ d[yCol] +"<br>"+ xCol +": "+ d[xCol];
			tooltip.html(text)
				.style("left", (d3.event.pageX) + "px")
				.style("top", (d3.event.pageY - 40) + "px");
		})
		.on("mouseout", function(d) {
			tooltip.transition().duration(500).style("opacity", 0); 
		});




	
}
load_data(0,update_data);




