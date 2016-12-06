



var source = 0;	// current data source
var limit = 20;

// data sources
var sources = [
	{"name":"drvlone (tracts)", "data": "16740_trans_drvlone_sample.csv","col1":"t_drvloneM","col2":"t_drvloneE"},
	{"name":"drvlone (regions)", "data": "16740_trans_drvlone_sample.csv","col1":"r_drvloneM","col2":"r_drvloneE"},
	{"name":"transit (tracts)", "data": "16740_trans_transit_sample.csv","col1":"t_transitM","col2":"t_transitE"},
	{"name":"transit (regions)", "data": "16740_trans_transit_sample.csv","col1":"r_transitM","col2":"r_transitE"},
	{"name":"vehiclpp (tracts)", "data": "16740_trans_vehiclpp_sample.csv","col1":"t_vehiclppM","col2":"t_vehiclppE"},
	{"name":"vehiclpp (regions)", "data": "16740_trans_vehiclpp_sample.csv","col1":"r_vehiclppM","col2":"r_vehiclppE"}
];


function load_data(source,callback){
	d3.csv("../data/"+ sources[source].data, function(data){
		//console.log(data);
		data = remove_rows(data,"inf"); 	// remove rows with "inf" (infinity)
		data = data.slice(0,limit);			// confine to limit
		display_table(data,"table",20);		// display table
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
    boxW = 10, boxH = 2;

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

	// data fixing
	data.forEach(function(row,i) {
		//console.log(row);

		// the x column is the margin of error
		// so we create a high / low
		data[i].min = parseFloat(row[yCol]) - parseFloat(row[xCol]);
		data[i].max = parseFloat(row[yCol]) + parseFloat(row[xCol]);

	});
	//console.log(data)



	// set X min, max
	//var xExtent = d3.extent(data, function(d){ return parseFloat(d[xCol]) });
	//xExtent[0] = -.001; // tweak X axis to allow -0

	// scale xAxis data (domain/input) onto x range (output)
	var xScale = d3.scaleLinear()
		.domain([0,limit])
		.range([margin.left,width-margin.right]);

	// set Y min, max
	//var yExtent = d3.extent(data, function(d){ return d[yCol] });

	// set min/max above w/ data.forEach
	var min = d3.min(data, function(d) { return parseFloat(d["min"]); });
	var max = d3.max(data, function(d) { return parseFloat(d["max"]); });
	//console.log( min, max);

	var yExtent = [min,max]; // note: these are flipped because 0,0 is top,left
	//console.log(yExtent);

	// function to map Y data (input) onto Y range (output)
	var yScale = d3.scaleLinear()
		.domain(yExtent)
		.range([height-margin.bottom, margin.top]); // reverse so 0,0 is bottom,left

/*
	var line = g.selectAll("lines").data(data).enter().append("line")
		.attr("x1", 100) 
		.attr("y1", 0) 
		.attr("x2", 100) 
		.attr("y2", 200)
		.attr("stroke-width", boxW)
		.attr("stroke", "red");	
*/





	var lines = g.selectAll("line")
		.data(data).enter()
		.append("line");

	// margin of error lines
	g.selectAll("line").transition().duration(700)
		.attr("x1", function(d,i){ return xScale( i )+boxW*1.5 }) 
		.attr("y1", function(d,i){ return yScale( d["min"] )+boxH*1.5 }) 
		.attr("x2", function(d,i){ return xScale( i )+boxW*1.5 }) 
		.attr("y2", function(d,i){ return yScale( d["max"] )+boxH/1.5 }) 
		.attr("stroke-width", boxW)
		.attr("stroke", "red");	

	// add interaction: show/hide tooltip
	g.selectAll("line")
		.on("mouseover", function(d) {
			console.log(d3.select(this)); // log id
			tooltip.transition().duration(200).style("opacity", .9); // show tooltip
			var text = "TID: "+ d["TID"] +"<br>RID: "+ d["RID"] +"<br>"+
						yCol +" "+ d[yCol] +
					   "<br>Margin of Error: "+ d[xCol] +
					   "<br>Range: "+ d["min"] +" --> "+ d["max"];
			tooltip.html(text)
				.style("left", (d3.event.pageX) + "px")
				.style("top", (d3.event.pageY - 40) + "px");
		})
		.on("mouseout", function(d) {
			tooltip.transition().duration(500).style("opacity", 0); 
		});

	// select points
	var box = g.selectAll("rect.box")
		.data(data).enter()
		.append("rect");

	g.selectAll("rect")
			.attr("class", "box")
		.transition().duration(700)
			.attr("x", function(d,i){ return xScale( i )+boxW })
			.attr("y", function(d){ return yScale( parseFloat(d[yCol]) ) })
			.attr("width", boxW)
			.attr("height", boxH)
			.attr("id", function(d){ return "box_"+ d[yCol] +"_"+ d[xCol] })
			.style("opacity", .9)
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
/*
	// add X axis properties and call above function
	d3.select("svg").append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + (height-margin.bottom) + ")");
*/
	// add Y axis properties and call above function
	d3.select("svg").append("g")	
		.attr("class", "y axis")
		.attr("transform", "translate(" + (margin.left) + ",0)");

	// update X/Y axes
//	d3.select(".x.axis").transition().duration(500).call(xAxis); 
	d3.select(".y.axis").transition().duration(500).call(yAxis); 
/*
	// add X axis label
	svg.selectAll(".x.axis .label").remove();
	d3.select(".x.axis").append("text")
		.text(xAxisLabelText + xCol) 
        	.style("text-anchor", "middle")
			.attr("x", (width / 2))
			.attr("y", margin.bottom / 1.1)
			.attr("class", "label");
*/
	// add Y axis label
	svg.selectAll(".y.axis .label").remove();
	d3.select(".y.axis").append("text")
		.text(yAxisLabelText + yCol) 
	        .style("text-anchor", "middle")
			.attr("class", "label")
			.attr("transform", "rotate (-90, -43, 0) translate(-280)");

}


