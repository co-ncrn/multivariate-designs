
/**
 *	Select MSA script to test API
 *	@author Owen Mundy
 */


var msas = [], 											// holds all the MSAs
	current = { "msa":"", "scenario":"", "data":"" },	// object to store current data reference
	api_url = "http://localhost:3000/api/",				// api url
	msa_options = "<option val=''></option>",			// default empty value in select menus
	scenario_options = "<option val=''></option>";


$(document).ready(function(){

	// define chosen() options
	$("#msa_select_box").chosen({
		disable_search_threshold: 10,
		no_results_text: "Oops, nothing found!",
		width: "95%"
	});
	$("#scenario_select_box").chosen({
		disable_search_threshold: 10,
		no_results_text: "Oops, nothing found!",
		width: "95%"
	});
	// on chosen() change events
	$('#msa_select_box').on('change', function(evt, params) {
		updateMSA(params.selected);
	});
	$('#scenario_select_box').on('change', function(evt, params) {
		updateData(params);
	});

	init(); // load data, map, page
});





/**
 *	Initialize page
 */
function init(){
	
	// get _metadata for menus, etc.
	d3.json(api_url+ "_metadata", function(error, json) {
		if (error) return console.warn(error);		// handle error
		msas = json.response; 			// update MSAs
		//console.log(data);
		$("#output").val( "all MSAs: \n"+ JSON.stringify(msas) );
		createMSAMenu(json.response); 	// create MSA menu
	});

}


/**
 *	Build the MSA menu when the page loads
 */
function createMSAMenu(json){

	// loop through msas
	for (var key in json) {
	    if (!json.hasOwnProperty(key)) continue;	// skip loop if the property is from prototype
	   	//console.log(key,data[key])

	    // add MSAs to select options
		msa_options += optionHTML(key, key +" - "+ json[key][0].description);
	}
	$("#msa_select_box").append( msa_options ).trigger('chosen:updated'); // update select
}


/**
 *	Update MSA
 * 	This changes the title, menu, chart, and map
 */
function updateMSA(msa){
	current.msa = msa;			// update current obj
	updateTitle(msa);			// update title
	updateScenarioMenu(msa);	// update scenario menu
	//updateChart(msa);		// update d3 data
	//updateMap(point);			// update map data
}


/**
 *	Update Title
 */
function updateTitle(msa){
}

/**
 *	Build the scenario menu based on MSA selection
 */
function updateScenarioMenu(msa){
	console.log(msa, msas[msa]);

	$("#output").val( msa +": \n"+ JSON.stringify(msas[msa]) ); // testing

	// use msa to update the scenario box
	var scenario_options = "<option val=''></option>";

	// for each scenario
	for (var i = 0; i <  msas[msa].length; i++) {
		//console.log( msas[msa][i]);

		var scenario = msas[msa][i].scenario;

		// add optiongroup with scenario
		scenario_options += "<optgroup label='"+ dataDict[ scenario ] +"'>";

		// for each data type
		for (var j = 0; j <  msas[msa][i].data.length; j++) {
			//console.log( msas[msa][i].data[j]);

			var data = msas[msa][i].data[j];

			// add scenario
			scenario_options += optionHTML(scenario +"-"+ data, dataDict[data]);
		}
		scenario_options += "</optgroup>";
	}

	// update options
	$("#scenario_select_box").append( scenario_options ).trigger('chosen:updated');
 	// trying to open it... :-P
	$('#scenario_select_box').trigger('chosen:open');

}
function optionHTML(val,text){
	var option = "";
	option += "<option value='"+ val +"'>"+ text +"</option>";
	return option;
}



function updateData(params){
	var p = params.selected.split("-");
	current.scenario = p[0];
	current.data = p[1];
	console.log("updateData() called", current);

	//if (!current || !current.msa || !current.scenario || !current.data)
	//	return false;

	// get data from server
	d3.json(api_url + current.msa +"/"+ current.scenario +"/"+ current.data, function(error, json) {
		if (error) return console.warn(error);		// handle error
		//console.log(data);
		$("#output").val( JSON.stringify(current) +": \n"+ JSON.stringify(json.response) );


	});

}













var source = 0,	// current data source
	limit = 20, // data limit
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


function load_api_data(_msa,_scenario,_data,callback){

	d3.json("http://localhost:3000/api/"+_msa+"/"+_scenario+"/"+_data, function(error, json) {
		if (error) return console.warn(error);
		data = json;
		console.log(data);
	});



}
//load_api_data("16740","gen","married");







/*



function fixdata(data){
	// data fixing
	data.forEach(function(row,i) {
		//console.log(row);

		data[i].TID = data[i].TID.replace("g","");

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








var shtml = '';
// add buttons for ALL data sources
for (var i in msas){

	//


	$(".sources").append('<br>'+ i +": ");

	for (var j in scenarios_data[i]){

		

		shtml ='<a id="tract'+ i +'">'+ scenarios_data[i][j] +'</a> ';
		$(".sources").append(shtml);
		// add listeners
		$("#tract"+ i).on("mouseup",function(){
			load_data(this.id.substr(this.id.length - 1),"tract",tabulate);
		});


	}
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
	d3.selectAll(".tid").data(data)
		.classed("button_sliding_bg_left",true)
		.attr("source",source)
		.attr("row",function(d,i) { return i; })
		.text(function(d) { return d.TID; });
	d3.selectAll(".rid").data(data)
		.classed("button_sliding_bg_right",true)
		.attr("source",source)
		.attr("row",function(d,i) { return i; })
		.text(function(d) { return d.RID; });
	d3.selectAll(".est").data(data).attr("row",function(d,i) { return i; }).text(function(d) { return d[cdo.est]; });
	d3.selectAll(".err").data(data).attr("row",function(d,i) { return i; }).text(function(d) { return d[cdo.err]; });
	d3.selectAll(".svgCell").data(data).attr("row",function(d,i) { return i; })

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


		
	function selectRow(r){
		//d3.selectAll("td.tid").classed("highlight", true);
	}

	function selectTID(d,i){
		d3.selectAll(".tid").classed("highlight", true);
		d3.selectAll(".rid").classed("highlight", false);
		var s = d3.select(this).attr("source");
		load_data(s,"tract",tabulate);
	}
	function selectRID(d,i){
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







