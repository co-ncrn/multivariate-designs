
/**
 *	6_boxplot_table: A boxplot chart showing MOE (Margin of Error) in ACS data before and after regionalization
 *	@author Owen Mundy
 */

var source = 0,	// current data source
	limit = 10, // data limit
	status = "tract"; // current regselector status

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
//	{"name":"avgrent", "file": "16740_hous_avgrent_sample.csv",
//		"tractError":"t_avgrentM","tractEstimate":"t_avgrentE","regionError":"r_avgrentM","regionEstimate":"r_avgrentE"},
//	{"name":"avgrent (by high MOE)", "file": "16740_hous_avgrent_byMOE_sample.csv",
//		"tractError":"t_avgrentM","tractEstimate":"t_avgrentE","regionError":"r_avgrentM","regionEstimate":"r_avgrentE"},
	{"name":"avghmval", "file": "16740_hous_avghmval_sample.csv",
		"tractError":"t_avghmvalM","tractEstimate":"t_avghmvalE","regionError":"r_avghmvalM","regionEstimate":"r_avghmvalE"},
	{"name":"chabvpov (16740, by high MOE)", "file": "16740_pov_chabvpov_highMOE_sample.csv",
		"tractError":"t_chabvpovM","tractEstimate":"t_chabvpovE","regionError":"r_chabvpovM","regionEstimate":"r_chabvpovE"},
	{"name":"chabvpov (16700, by high MOE)", "file": "16700_pov_chabvpov_highMOE_sample.csv",
		"tractError":"t_chabvpovM","tractEstimate":"t_chabvpovE","regionError":"r_chabvpovM","regionEstimate":"r_chabvpovE"}
];

/**
 *	Load data from remote source
 *	@param {Integer} _source - the data source index
 *	@param {String} status - "tract" or "region"
 *	@param {Function} callback - the callback that handles the response
 */
function load_data(_source,status,callback){
	source = _source;
	d3.csv("../data/"+ sources[source]["file"], function(data){
		//console.log(data);
		data = remove_rows(data,"inf"); 		// remove rows with "inf" (infinity)
		//limit = Math.ceil(Math.random()*10)+10; 	// limit is randomized to mimic map interaction
		data = data.slice(0,limit);				// confine to limit
		display_table(data,"table",limit);		// display table
		//console.log(data);
		callback(data,status);
	});
}


function fixdata(data){
	// data fixing
	data.forEach(function(row,i) {
		//console.log(row);

		// store names in row so easier to reference
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
		data[i].tractError = dec_conv(data[i].tractError);
		data[i].regionError = dec_conv(data[i].regionError);
		data[i].tractEstimate = dec_conv(data[i].tractEstimate);
		data[i].regionEstimate = dec_conv(data[i].regionEstimate);

	});
	return data;
}
function dec_conv(num){

	var decimal = 1000;
	
	if (num > 1000) {
		var decimal = 1;
	} else if (num > 100){
		var decimal = 10;
	} else if (num > 10){
		var decimal = 10;
	} else if (num > 1){
		var decimal = 1000;
	} else if (num > .1){
		var decimal = 1000;
	} else if (num > .01){
		var decimal = 1000;
	}
	num = Math.round(num * decimal) / decimal;
	return num;
}




// add buttons for data sources
for (var i in sources){
	var html = '<p><button class="btn btn-sm data-btn" id="tract'+ i +'">'+ sources[i].name +' (tract)</button> ';
	html += '<button class="btn btn-sm data-btn" id="region'+ i +'">'+ sources[i].name +' (region)</button></p>';
	$(".sources").append(html);
	// add listeners
	$("#tract"+ i).on("mouseover",function(){
		load_data(this.id.substr(this.id.length - 1),"tract",tabulate);
	});
	$("#region"+ i).on("mouseover",function(){
		load_data(this.id.substr(this.id.length - 1),"region",tabulate);
	});
}



/**
 *	Return the Current Data Object
 */
function return_cdo(status){
	var cdo = {};
	// are we currently displaying tracts or regions
	if (status == "tract"){
		cdo.errMin = "tractErrorMin";
		cdo.errMax = "tractErrorMax";
		cdo.est = "tractEstimate";
		cdo.err = "tractError";
	} else if (status == "region"){
		cdo.errMin = "regionErrorMin";
		cdo.errMax = "regionErrorMax";
		cdo.est = "regionEstimate";
		cdo.err = "regionError";
	}
	return cdo;
}

/**
 *	Select the current column
 */
function select_col(node,state){
	console.log(d3.select(node));

	if (state == "on"){
		console.log("state = on");
		//d3.select(node).style("bgColor",".1");
	} else {
		console.log("state = off");
		//d3.select(node).style("background-color","#000000");	
	}

}



// svg properties
var margin = { top: 0, right: 0, bottom: 0, left: 0 },
	width = 300 - margin.left - margin.right,
    height = 20 - margin.top - margin.bottom,
    barW = 1.5, barHV = 8;

// create table
var table = d3.select('#chart').append('table').attr('class','tableText');
var thead = table.append('thead');
var	tbody = table.append('tbody');

// select header row
var theadtr = thead.append('tr');

// select th
theadtr.selectAll('th')
	.data(['Tracts','Regions','Estimate','Error']).enter()
	.append('th')
	.text(function (d) { return d; });

// select last th, add svg
theadtr.append('th').attr('class','svgHeader')
	.append("svg").attr("height",20);


/**
 * 	Build HTML table
 */
function tabulate(data,status) {

	console.log("tabulate()",data,status);

	data = fixdata(data);

	var cdo = return_cdo(status); // current data object

	//['TID','RID',cdo.est,cdo.err]

	// Y-SCALE: based on number of data
	var yScale = d3.scaleLinear()
		.domain([0,limit])
		.range([margin.top,height-margin.bottom]);

	// X-SCALE: using tract MOE min/max to show difference
	var xMin = d3.min(data, function(d) { return parseFloat(d["tractErrorMin"]); });
	var xMax = d3.max(data, function(d) { return parseFloat(d["tractErrorMax"]); });
	var xExtent = [xMin,xMax];
	//console.log(xExtent);
	var xScale = d3.scaleLinear()
		.domain(xExtent).nice()
		.range([margin.left,width-margin.right]);





	// set the update selection:
	var rows = tbody.selectAll('tr')
    	.data(data);

	// set the enter selection:
	var rowsEnter = rows.enter()
	    .append('tr');
console.log("source",source)
	// append text cells
	rowsEnter.append('td')
	    .attr("class", "tid")
	    .text(function(d) { return d.TID; });
	rowsEnter.append('td')
	    .attr("class", "rid")
	    .text(function(d) { return d.RID; });
	rowsEnter.append('td')
	    .attr("class", "est")
	    .text(function(d) { return d[cdo.est]; });
	rowsEnter.append('td')
	    .attr("class", "err")
	    .text(function(d) { return d[cdo.err];; });

	// append svg cell
	var svg = rowsEnter.append('td')
		.attr('class','svgCell')
	    .append('svg')
		    .attr("width", width)
		    .attr("height", height);
 	
 	// append horizontal bar to svg
	svg.append('rect').attr("class", "svgBar svgBarHorz");
	svg.append('rect').attr("class", "svgBar svgBarVert1");
	svg.append('rect').attr("class", "svgBar svgBarVert2");

	// append triangle to svg
	var tri = d3.symbol()
            .type(d3.symbolTriangle)
            .size(15);
	svg.append('path');
	svg.selectAll('path')		
			.attr('d',tri)
		    .attr("class", "svgTri")
			.attr('fill', "black");


	// transitions über alles!
	var t = d3.transition().duration(600);

	// select all columns by class, rebind the data
	d3.selectAll(".tid").data(data).attr("source",source).text(function(d) { return d.TID; });
	d3.selectAll(".rid").data(data).attr("source",source).text(function(d) { return d.RID; });
	d3.selectAll(".est").data(data).text(function(d) { return d[cdo.est]; });
	d3.selectAll(".err").data(data).text(function(d) { return d[cdo.err]; });

	// select svgs by class, rebind data, and set transitions
	d3.selectAll(".svgBarHorz")
		.data(data).transition(t)
			.attr("x", function(d,i){ return xScale( d[cdo.errMin] )}) 
			.attr("y", height/2 ) 
			.attr("width", function(d,i){ return xScale( d[cdo.errMax] ) - xScale( d[cdo.errMin] ) }) 
			.attr("height", barW);
	d3.selectAll(".svgBarVert1")
		.data(data).transition(t)
			.attr("x", function(d,i){ return xScale( d[cdo.errMin] )}) 
			.attr("y", 7 ) 
			.attr("width", barW) 
			.attr("height", barHV);	
	d3.selectAll(".svgBarVert2")
		.data(data).transition(t)
			.attr("x", function(d,i){ return xScale( d[cdo.errMax] )}) 
			.attr("y", 7 ) 
			.attr("width", barW) 
			.attr("height", barHV);		
	d3.selectAll(".svgTri")
		.data(data).transition(t)
			.attr('transform',function(d,i){ 
				return "translate("+ xScale( d[cdo.est] ) +","+ barHV*2 +") "; 
			});


	d3.selectAll(".tid")
	    .on("mouseover", selectTID);
	d3.selectAll(".rid")
	    .on("mouseover", selectRID);


		

	function selectTID(d, i){
		d3.selectAll("td.tid").classed("highlight", true);
		d3.selectAll("td.rid").classed("highlight", false);
		var s = d3.select(this).attr("source");
		load_data(s,"tract",tabulate);
	}
	function selectRID(d, i){
		d3.selectAll("td.tid").classed("highlight", false);
		d3.selectAll("td.rid").classed("highlight", true);
		var s = d3.select(this).attr("source");
		load_data(s,"region",tabulate);
	}


	// finally, the exit selection:
	rows.exit().remove(); 

/*


		
		
		




*/

/*

	svgrow.append("text")
		.attr("x",15)
		.attr("dy",10)
		.text("hello")
		.attr("text-anchor","middle")
		.style("stroke","white")
		.style("alignment-baseline","central");

*/


/*
	// MOE horizontal lines
	svgrow.selectAll("line.moeH")
		.data(data).enter()
		.append("line").attr("class", "moeH");

	svgrow.selectAll("line.moeH").transition().duration(700)
		.attr("x1", function(d,i){ return xScale( d[errMin] )}) 
		.attr("y1", function(d,i){ return yScale( i ) + boxW*1.5 }) 
		.attr("x2", function(d,i){ return xScale( d[errMax] ) }) 
		.attr("y2", function(d,i){ return yScale( i ) + boxW*1.5 }) 
		.attr("stroke-width", boxW)
		.attr("stroke", "red")
	;	
*/


/*
	// create a cell in each row for each column
	var cells = rows.selectAll('td')
		.data(function (row) {
			return cols.map(function (cols) {
				return {column: cols, value: row[cols]};
			});
		})
		.enter()
		.append('td')
		.text(function (d) { return d.value; });
*/




	//return table;



	create_scatterplot_axes(data,yScale,xScale,cdo.err,cdo.est);
}








/*
// scatterplot properties
var margin = { top: 40, right: 25, bottom: 20, left: 175 },
	width = 600 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    boxW = 1, boxH = 2;

// create SVG
var svg = d3.select("#chart")
	.append("div")
		.classed("svg-container", true) //container class to make it responsive
	.append("svg")
		// responsive SVG needs these 2 attributes and no width and height attr
		.attr("preserveAspectRatio", "xMinYMin meet")
		.attr("viewBox", "0 0 "+ width +" "+ height)
		.classed("svg-content-responsive", true); // class to make it responsive

var g = svg.append("g");

// chart labels
var xAxisLabelText = "(tract CV) ",
	xAxisLabelOffset = 0;
var yAxisLabelText = "",
	yAxisLabelOffset = 30;		

// create div for the tooltip
var tooltip = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);



  var colors = [
    '#cdf1f5',
    '#a8d3dd',
    '#81b2c1',
    '#58919d',
    '#53828e',
    '#58919d',
    '#81b2c1',
    '#a8d3dd'
  ];


var colX = [10,75,98,138],
	colWs = [65,20],
	charW = 10,
	colH = 18;
var colW = colWs[0], 
	colN = 0,
	colPaddingW = 5;


function set_colW(node){
	// width of node + padding on both sides
	return node.getBBox().width + (colPaddingW*2);
}


function select_field(node,state){
	colW = set_colW(node);
/*
	if (state == "on"){
		d3.select(node).transition().style("fill","#990000");
	} else {
		d3.select(node).transition().style("fill","#000000");	
	}
*/



//}




/** PREVIOUS METHOD FOR ADDING TABLE TO D3 - TAGGED FOR REMOVAL **/

function update_table(data,status,yScale,xScale,err,est){

	//console.log(data);
	console.log(data,status,yScale,xScale,err,est);


	



	// TID/RID vertical selector box
	g.selectAll("rect.regselector")
		.data(data).enter()
		.append("rect").attr("class", function(d,i){ return "regselector row_"+i; });

	var x = colX[colN];
	if (status == "region") x = colX[1]-colPaddingW;
	g.selectAll("rect.regselector")	
		.transition().duration(700)
			.attr("x", x-colPaddingW)
			.attr("y", function(d,i){ return yScale( i )-colH/2  })
			.attr("width", colW)
			.attr("height", colH)
			//.attr("id", function(d){ return "box_"+ d[est] +"_"+ d[err] })
			.style("opacity", 1.0)
			.style("fill", "#9bcdcd");	


	var headings = ["Tract","Region","Estimate","Error"];

	// COLUMN HEADINGS
	g.selectAll("text.headings")
		.data(headings).enter()
		.append("text").attr("class", function(d,i){ return "headings tableText"; });

	g.selectAll(".headings")	
		.text(function(d){ return d; })
			.style("text-anchor", "middle")
			.attr("x", function(d,i){ return colX[i]+20 })
			.attr("y", function(d,i){ return margin.top-15 })
			//.attr("transform", "translate(" + 0 + ","+ margin.top +")")
		.on("mouseover", function(d) {

			select_field(this,"on");
			colN = 0;
			update_data(data,"tract");
		})	
		.on("mouseout", function(d) {
			select_field(this,"off");
		})	
	;


	// TID text
	g.selectAll("text.tid")
		.data(data).enter()
		.append("text").attr("class", function(d,i){ return "tid tableText row_"+i +" col_tid"; });

	g.selectAll(".tid")	
		.text(function(d) { return d["TID"].replace("g",""); })
			.style("text-anchor", "start")
			.attr("x", colX[0])
			.attr("y", function(d,i){ return yScale( i ) + boxW*1.5 })
		.on("mouseover", function(d) {

			select_field(this,"on");
			colN = 0;
			update_data(data,"tract");
		})	
		.on("mouseout", function(d) {
			select_field(this,"off");
		})	
	;
 
	// RID text
	g.selectAll("text.rid")
		.data(data).enter()
		.append("text").attr("class", "rid tableText");

	g.selectAll("text.rid")	
		.text(function(d) { return d["RID"]; })
			.style("text-anchor", "end")
			.attr("x", colX[1])
			.attr("y", function(d,i){ return yScale( i ) + boxW*1.5 })
		.on("mouseover", function(d) {
			select_field(this,"on");
			colN = 1;
			update_data(data,"region");
		})	
		.on("mouseout", function(d) {
			select_field(this,"off");
		})	
	;
	// ESTIMATE
	g.selectAll("text.est")
		.data(data).enter()
		.append("text").attr("class", "est tableText");

	g.selectAll(".est")	
		.transition().delay(200)
		.text(function(d) { return d[est]; })
			.style("text-anchor", "start")
			.attr("x", colX[2])
			.attr("y", function(d,i){ return yScale( i ) + boxW*1.5 })
	;
	// ERROR
	g.selectAll("text.err")
		.data(data).enter()
		.append("text").attr("class", "err tableText");

	g.selectAll(".err")	
		.transition().delay(200)
		.text(function(d) { return "±"+ d[err]; })
			.style("text-anchor", "start")
			.attr("x", colX[3])
			.attr("y", function(d,i){ return yScale( i ) + boxW*1.5 })
	;



}





/**
 *	D3 SCATTERPLOT
 *	@param {Array} data - an array of objects
 *	@param {String} status - "tract" or "region"
 */
function update_data(data,status){
	//console.log(JSON.stringify(data));


	// data fixing
	data = fixdata(data);
	
	//console.log(data[i])

	// Y-SCALE: based on number of data
	var yScale = d3.scaleLinear()
		.domain([0,limit])
		.range([margin.top,height-margin.bottom]);

	// X-SCALE: using tract MOE min/max to show difference
	var xMin = d3.min(data, function(d) { return parseFloat(d["tractErrorMin"]); });
	var xMax = d3.max(data, function(d) { return parseFloat(d["tractErrorMax"]); });
	var xExtent = [xMin,xMax];
	// xScale
	var xScale = d3.scaleLinear()
		.domain(xExtent).nice()
		.range([margin.left,width-margin.right]);


	var cdo = return_cdo(status); // current data object


	//update_table(data,status,yScale,xScale,cdo.err,cdo.est);
	
	//tabulate(data,status,['TID','RID',cdo.est,cdo.err]);

/*

	// MOE vertical lines
	g.selectAll("line.moeV1")
		.data(data).enter()
		.append("line").attr("class", "moeV1");
	
	g.selectAll("line.moeV1").transition().duration(700)
		.attr("x1", function(d,i){ return xScale( d[cdo.errMin] )}) 
		.attr("y1", function(d,i){ return yScale( i ) + -boxW }) 
		.attr("x2", function(d,i){ return xScale( d[cdo.errMin] ) }) 
		.attr("y2", function(d,i){ return yScale( i ) + boxW*4 }) 
		.attr("stroke-width", boxW)
		.attr("stroke", "red")
	;
	g.selectAll("line.moeV2")
		.data(data).enter()
		.append("line").attr("class", "moeV2");
	
	g.selectAll("line.moeV2").transition().duration(700)
		.attr("x1", function(d,i){ return xScale( d[cdo.errMax] )}) 
		.attr("y1", function(d,i){ return yScale( i ) + -boxW }) 
		.attr("x2", function(d,i){ return xScale( d[cdo.errMax] ) }) 
		.attr("y2", function(d,i){ return yScale( i ) + boxW*4 }) 
		.attr("stroke-width", boxW)
		.attr("stroke", "red")
	;	

	// MOE horizontal lines
	g.selectAll("line.moeH")
		.data(data).enter()
		.append("line").attr("class", "moeH");

	g.selectAll("line.moeH").transition().duration(700)
		.attr("x1", function(d,i){ return xScale( d[cdo.errMin] )}) 
		.attr("y1", function(d,i){ return yScale( i ) + boxW*1.5 }) 
		.attr("x2", function(d,i){ return xScale( d[cdo.errMax] ) }) 
		.attr("y2", function(d,i){ return yScale( i ) + boxW*1.5 }) 
		.attr("stroke-width", boxW)
		.attr("stroke", "red")
	;	

	// add interaction: show/hide tooltip
	g.selectAll("line.moeH")
		.on("mouseover", function(d) {
			//console.log(d3.select(this)); // log id
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
/*
	// TRIANGLES
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
			.attr('transform',function(d,i){ return "translate("+ xScale( parseFloat(d[cdo.est]))  +","+ (yScale(i)+ boxW*3.5) +") "; });

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




	create_scatterplot_axes(data,yScale,xScale,cdo.err,cdo.est);
	*/
}
load_data(1,"tract",tabulate);





/* 
 *	Create axes and labels
 *	@param {Function} yScale - returns a scale
 *	@param {Function} xScale - returns a scale
 *	@param {Float} err - "tractError" or "regionError" from above
 *	@param {Float} est - "tractEst" or "regionEst" from above
 */
function create_scatterplot_axes(data,yScale,xScale,err,est){

	// keep tick labels from overlapping
	var ticks = 5;
	if (parseFloat(data[0][est]) > 1000) ticks = 4;

	// set X/Y axes functions
	var xAxis = d3.axisTop()
		.scale(xScale)
			.ticks(ticks)		
			.tickSizeInner(-height)
			.tickSizeOuter(0)
			.tickPadding(10)
	;
	// add X axis properties
	d3.select(".svgHeader svg").append("g")	
		.attr("class", "x axis tableText")
		.attr("transform", "translate(" + 0 + ","+ (25) +")")
	;
	// update axis	
	d3.select(".x.axis").transition().duration(500).call(xAxis); 

}


