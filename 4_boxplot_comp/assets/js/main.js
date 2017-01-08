



var source = 0;	// current data source
var limit = 40;

// data sources
var sources = [
	{"name":"drvlone", "file": "16740_trans_drvlone_sample.csv",
		"tractError":"t_drvloneM","tractEstimate":"t_drvloneE","regionError":"r_drvloneM","regionEstimate":"r_drvloneE"},
	{"name":"transit", "file": "16740_trans_transit_sample.csv",
		"tractError":"t_transitM","tractEstimate":"t_transitE","regionError":"r_transitM","regionEstimate":"r_transitE"},
	{"name":"vehiclpp", "file": "16740_trans_vehiclpp_sample.csv",
		"tractError":"t_vehiclppM","tractEstimate":"t_vehiclppE","regionError":"r_vehiclppM","regionEstimate":"r_vehiclppE"},
	{"name":"avgrooms", "file": "16740_hous_avgrooms_sample.csv",
		"tractError":"t_avgroomsM","tractEstimate":"t_avgroomsE","regionError":"r_avgroomsM","regionEstimate":"r_avgroomsE"},
	{"name":"occupied", "file": "16740_hous_occupied_sample.csv",
		"tractError":"t_occupiedM","tractEstimate":"t_occupiedE","regionError":"r_occupiedM","regionEstimate":"r_occupiedE"},
	{"name":"avgrent", "file": "16740_hous_avgrent_sample.csv",
		"tractError":"t_avgrentM","tractEstimate":"t_avgrentE","regionError":"r_avgrentM","regionEstimate":"r_avgrentE"},
	{"name":"avgrent (by high MOE)", "file": "16740_hous_avgrent_byMOE_sample.csv",
		"tractError":"t_avgrentM","tractEstimate":"t_avgrentE","regionError":"r_avgrentM","regionEstimate":"r_avgrentE"},
	{"name":"avghmval", "file": "16740_hous_avghmval_sample.csv",
		"tractError":"t_avghmvalM","tractEstimate":"t_avghmvalE","regionError":"r_avghmvalM","regionEstimate":"r_avghmvalE"},
	{"name":"chabvpov (16740, by high MOE)", "file": "16740_pov_chabvpov_highMOE_sample.csv",
		"tractError":"t_chabvpovM","tractEstimate":"t_chabvpovE","regionError":"r_chabvpovM","regionEstimate":"r_chabvpovE"},
	{"name":"chabvpov (16700, by high MOE)", "file": "16700_pov_chabvpov_highMOE_sample.csv",
		"tractError":"t_chabvpovM","tractEstimate":"t_chabvpovE","regionError":"r_chabvpovM","regionEstimate":"r_chabvpovE"}
];


function load_data(_source,_status,callback){
	source = _source;
	d3.csv("../data/"+ sources[source]["file"], function(data){
		//console.log(data);
		data = remove_rows(data,"inf"); 	// remove rows with "inf" (infinity)
		data = data.slice(0,limit);			// confine to limit
		display_table(data,"table",40);		// display table
		//console.log(data);
		callback(data,_status);
	});
}


// buttons for data sources
for (var i in sources){
	var html = '<p><button class="btn btn-sm data-btn" id="tract'+ i +'">'+ sources[i].name +' (tract)</button> ';
	html += '<button class="btn btn-sm data-btn" id="region'+ i +'">'+ sources[i].name +' (region)</button></p>';
	$(".sources").append(html);
	// add listeners
	$("#tract"+ i).on("mouseover",function(){
		load_data(this.id.substr(this.id.length - 1),"tract",update_data);
	});
	$("#region"+ i).on("mouseover",function(){
		load_data(this.id.substr(this.id.length - 1),"region",update_data);
	});
}


/* 
 *	SCATTERPLOT PROPERTIES 
 */

var margin = { top: 20, right: 15, bottom: 20, left: 15 },
	width = 600 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    boxW = 2, boxH = 2;

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

var yAxisLabelText = "",
	yAxisLabelOffset = 30;		

// create div for the tooltip
var tooltip = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);




/**
 *	D3 SCATTERPLOT
 *	@data 
 *	@status String tract|region
 */
function update_data(data,status){
	//console.log(JSON.stringify(data));



	// data fixing
	data.forEach(function(row,i) {
		//console.log(row);

		// store names in row
		data[i].tractError = parseFloat(row[sources[source].tractError]);
		data[i].tractEstimate = parseFloat(row[sources[source].tractEstimate]);
		data[i].regionError = parseFloat(row[sources[source].regionError]);
		data[i].regionEstimate = parseFloat(row[sources[source].regionEstimate]);

		// create TRACT scale (a min / max for each TRACT)
		// this will be the scale for the axis as well so the change will be obvious
		data[i].tractErrorMin = data[i].tractEstimate - data[i].tractError;
		data[i].tractErrorMax = data[i].tractEstimate + data[i].tractError;

		// create REGION scale (a min / max for each REGION)
		data[i].regionErrorMin = data[i].regionEstimate - data[i].regionError;
		data[i].regionErrorMax = data[i].regionEstimate + data[i].regionError;

		// clean numbers
		data[i].tractError = Math.round(data[i].tractError * 1000) / 1000;
		data[i].tractEstimate = Math.round(data[i].tractEstimate * 1000) / 1000;
		data[i].regionError = Math.round(data[i].regionError * 1000) / 1000;
		data[i].regionEstimate = Math.round(data[i].regionEstimate * 1000) / 1000;
	});
	console.log(data[i])



	// Y-SCALE
	var yScale = d3.scaleLinear()
		.domain([0,limit])
		.range([margin.top,height-margin.bottom]);







	// set min/max (from above data.forEach)
	var xMin = d3.min(data, function(d) { return parseFloat(d["tractErrorMin"]); });
	var xMax = d3.max(data, function(d) { return parseFloat(d["tractErrorMax"]); });
	//console.log([xMin,xMax]);
	var xExtent = [xMin-.03,xMax];

	//var xExtent = d3.extent(data, function(d){ return parseFloat(d["tractError"]) });
	//xExtent[0] = -.001; // tweak X axis to allow -0

	// X-SCALE
	var xScale = d3.scaleLinear()
		.domain(xExtent).nice()
		.range([margin.left,width-margin.right]);




	// choose one of two different data sources
	if (status == "tract"){
		var errMin = "tractErrorMin";
		var errMax = "tractErrorMax";
		var est = "tractEstimate";
		var err = "tractError";
	} else {
		var errMin = "regionErrorMin";
		var errMax = "regionErrorMax";
		var est = "regionEstimate";
		var err = "regionError";
	}



	// MARGIN OF ERROR LINES
	var lines = g.selectAll("line")
		.data(data).enter()
		.append("line");

	g.selectAll("line").transition().duration(700)
		.attr("x1", function(d,i){ return xScale( d[errMin] )}) 
		.attr("y1", function(d,i){ return yScale( i )+boxW*1.5 }) 
		.attr("x2", function(d,i){ return xScale( d[errMax] ) }) 
		.attr("y2", function(d,i){ return yScale( i )+boxW*1.5 }) 
		.attr("stroke-width", boxW)
		.attr("stroke", "red");	

	// add interaction: show/hide tooltip
	g.selectAll("line")
		.on("mouseover", function(d) {
			console.log(d3.select(this)); // log id
			tooltip.transition().duration(200).style("opacity", .9); // show tooltip
			var text = 	"TRACT"+
						"<br>TID: "+ d["TID"] +
						"<br>Estimate: "+ d["tractEstimate"] +
						"<br>Error: "+ d["tractError"] +
						"<br>Error range: "+ Math.round(d["tractErrorMin"] * 1000) / 1000 +" --> "+ Math.round(d["tractErrorMax"] * 1000) / 1000+

						"<br><br>REGION" +
						"<br>RID: "+ d["RID"] +
						"<br>Estimate: "+ d["regionEstimate"]  +
						"<br>Error: "+ d["regionError"] +
						"<br>Error range: "+ Math.round(d["regionErrorMin"] * 1000) / 1000 +" --> "+ Math.round(d["regionErrorMax"] * 1000) / 1000
						;
			tooltip.html(text)
				.style("left", (d3.event.pageX) + "px")
				.style("top", (d3.event.pageY - 40) + "px");
		})
		.on("mouseout", function(d) {
			tooltip.transition().duration(500).style("opacity", 0); 
		});
/*
	// select points
	var box = g.selectAll("rect.box")
		.data(data).enter()
		.append("rect");

	g.selectAll("rect")
			.attr("class", "box")
		.transition().duration(700)
			.attr("x", function(d,i){ return yScale( i )+boxW })
			.attr("y", function(d){ return xScale( parseFloat(d[est]) ) })
			.attr("width", boxW)
			.attr("height", boxH)
			.attr("id", function(d){ return "box_"+ d[est] +"_"+ d[err] })
			.style("opacity", .9)
			.style("fill", "black");	

	// add interaction: show/hide tooltip
	g.selectAll("rect.box")
		.on("mouseover", function(d) {
			//console.log(d3.select(this).attr("id")); // log id
			tooltip.transition().duration(200).style("opacity", .9); // show tooltip
			var text = 	"TRACT"+
						"<br>TID: "+ d["TID"] +
						"<br>Estimate: "+ d["tractEstimate"] +
						"<br>Error: "+ d["tractError"] +
						"<br>Error range: "+ Math.round(d["tractErrorMin"] * 1000) / 1000 +" --> "+ Math.round(d["tractErrorMax"] * 1000) / 1000+

						"<br><br>REGION" +
						"<br>RID: "+ d["RID"] +
						"<br>Estimate: "+ d["regionEstimate"]  +
						"<br>Error: "+ d["regionError"] +
						"<br>Error range: "+ Math.round(d["regionErrorMin"] * 1000) / 1000 +" --> "+ Math.round(d["regionErrorMax"] * 1000) / 1000
						;
			tooltip.html(text)
				.style("left", (d3.event.pageX) + "px")
				.style("top", (d3.event.pageY - 40) + "px");
		})
		.on("mouseout", function(d) {
			tooltip.transition().duration(500).style("opacity", 0); 
		});
*/
	var tri = d3.symbol()
            .type(d3.symbolTriangle)
            .size(15)
	;
	var tris = g.selectAll('path')
			.data(data).enter()
			.append('path');

	g.selectAll('path')		
			.attr('d',tri)
		.transition().duration(700)
			.attr('fill', "black")
			//.attr('stroke-width',1)
			.attr('transform',function(d,i){ console.log(i,yScale(i)+1); return "translate("+ xScale( parseFloat(d[est]))  +","+ yScale(i+.7) +") "; });

	// add interaction: show/hide tooltip
	g.selectAll("path")
		.on("mouseover", function(d) {
			//console.log(d3.select(this).attr("id")); // log id
			tooltip.transition().duration(200).style("opacity", .9); // show tooltip
			var text = 	"TRACT"+
						"<br>TID: "+ d["TID"] +
						"<br>Estimate: "+ d["tractEstimate"] +
						"<br>Error: "+ d["tractError"] +
						"<br>Error range: "+ Math.round(d["tractErrorMin"] * 1000) / 1000 +" --> "+ Math.round(d["tractErrorMax"] * 1000) / 1000+

						"<br><br>REGION" +
						"<br>RID: "+ d["RID"] +
						"<br>Estimate: "+ d["regionEstimate"]  +
						"<br>Error: "+ d["regionError"] +
						"<br>Error range: "+ Math.round(d["regionErrorMin"] * 1000) / 1000 +" --> "+ Math.round(d["regionErrorMax"] * 1000) / 1000
						;
			tooltip.html(text)
				.style("left", (d3.event.pageX) + "px")
				.style("top", (d3.event.pageY - 40) + "px");
		})
		.on("mouseout", function(d) {
			tooltip.transition().duration(500).style("opacity", 0); 
		});




	create_scatterplot_axes(yScale,xScale,err,est);
}
load_data(1,"tract",update_data);





/* 
 *	CREATE AXES + LABELS 
 */
function create_scatterplot_axes(yScale,xScale,err,est){

	// set X/Y axes functions
	var xAxis = d3.axisTop()
		.scale(xScale)
.ticks(14)		
.tickSizeInner(-height)
.tickSizeOuter(0)
.tickPadding(10)
	;

	// add X axis properties and call above function
	d3.select("svg").append("g")	
		.attr("class", "x axis")
		.attr("transform", "translate(" + 0 + ","+ margin.top +")")
	;

	// update axis	
	d3.select(".x.axis").transition().duration(500).call(xAxis); 

/*
	// add X axis label
	svg.selectAll(".x.axis .label").remove();
	d3.select(".x.axis").append("text")
		.text(xAxisLabelText + err) 
        	.style("text-anchor", "middle")
			.attr("x", (width / 2))
			.attr("y", margin.bottom / 1.1)
			.attr("class", "label");
*/


//	var yAxis = d3.axisTop().scale(xScale);
/*
	// add Y axis properties and call above function
	d3.select("svg").append("g")
		.attr("class", "y axis")
		.attr("transform", "translate(0," + (height-margin.bottom) + ")");
*/

	// update X/Y axes
//	d3.select(".x.axis").transition().duration(500).call(xAxis); 

/*
	// add Y axis label
	svg.selectAll(".x.axis .label").remove();
	d3.select(".x.axis").append("text")
		.text(xAxisLabelText + est) 
	        .style("text-anchor", "middle")
			.attr("class", "label")
			.attr("transform", "rotate (-90, -43, 0) translate(-280)");
*/
}


