
/**
 *	8_boxplot_table: 
 *		A boxplot chart showing MOE (Margin of Error) in ACS data before and after regionalization
 * 		*** THE FIRST TO BE CONNECTED TO API, THE LAST BEFORE INTEGRATION I MAIN SITE ***
 *	@author Owen Mundy
 */

var msas = {},
	current = { "msa":"", "scenario":"", "data":"" },
	current_id = "",
	currentScenario = {},
	source = 0,	// current data source
	limit = 20, // data limit
	status = "tract"; // current regselector status

var api_url = "http://localhost:3000/api"; 	// local API
api_url = "http://207.38.84.184/api";		// remote API

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



/**
 *	Get data from server
 */
function getScenarioData(){
	var url = api_url + current.msa +"/"+ current.scenario +"/"+ current.data;
	console.log("getScenarioData()", url);
	d3.json(url, function(error, json) {
		if (error) return console.warn(error);		// handle error
		//console.log(data);
		currentScenario = json.response;

		//updateChart();								// update chart
		
		// testing
		$("#output").val( JSON.stringify(current) +": \n"+ JSON.stringify(json.response) );
	});
}



function load_api_data(id,status,callback){
	console.log("load_api_data()", id);
	current_id = id;
	var arr = id.split("-");
	current.msa = arr[0];
	current.scenario = arr[1];
	current.data = arr[2];
	d3.json(api_url+"/"+ current.msa +"/"+ current.scenario +"/"+ current.data , function(error, json) {
		if (error) return console.warn(error);
		data = json.response;
		//console.log(data);
		callback(data,status);
	});
}




/*

// data reference
var scenarios_data = {
	"gen": ["occupied","married","bachdeg","samehous","white","black","hisp","under18","65over","avgrooms","avghhinc","pphh"],
	"hous": ["occupied","pctown","pctrent","snglfmly","avgrooms","avghmval","avgrent"],
	"pov": ["chabvpov","abvpov","employed","hsincown","hsincrent"],
	"trans": ["drvlone","transit","vehiclpp","avgcmmte"]
};
*/

function returnMSAs(callback){
	d3.json(api_url + "/_metadata", function(error, json) {
		if (error) return console.warn(error);
		//console.log("MSAs -> ", json.response);
		callback(json.response);
	});
}

function buildMSAMenu(_msas){
	msas = _msas;
	//console.log("MSAs -> ", msas);

	// add buttons
	var shtml = '', count = 0;
	// for each MSA
	for (var msa in msas){
		//console.log("msa -> ", msa);

		// for each scenario
		for (var s in msas[msa]){
			//console.log("s -> ", msas[msa][s]);
			shtml = '<b>'+ msa +"-"+ msas[msa][s].scenario +'</b> ';
			$(".sources").append(shtml);

			// for each data
			for (var d in msas[msa][s].data){
				//console.log("d -> ", msas[msa][s].data[d]);

				var id = msa +"-"+ msas[msa][s].scenario +"-"+ msas[msa][s].data[d];
				shtml = '<a href="#" id="'+ id +'">'+  msas[msa][s].data[d] +'</a> ';
				$(".sources").append(shtml);

				/**/
				// add listeners
				$("#"+ id).on("mouseup",function(){
					//load_data(this.id.substr(this.id.length - 1),"tract",tabulate);
					//console.log(this.id);
					load_api_data(this.id,"tract",tabulate);
				});
	
			}
			$(".sources").append("<br>");
		}
		if (++count > 3) break;
	}
}
returnMSAs(buildMSAMenu);

/* // may still be useful for testing
// add buttons for data sources
function add_source_buttons(){
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
}
*/

/**
 *	Return the Current Data Object
 */
function return_cdo(status){
	console.log("return_cdo() -> ",status);
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

	console.log("tabulate()",data);

	data = fixdata(data);

	var cdo = return_cdo(status); // current data object
	console.log("cdo",cdo);

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
		.attr("current_source",current_id)
		.attr("row",function(d,i) { return i; })
		.text(function(d) { return d.TID; });
	d3.selectAll(".rid").data(data)
		.classed("button_sliding_bg_right",true)
		.attr("current_source",current_id)
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
	//	var s = d3.select(this).attr("current_source");
	//	load_data(s,"tract",tabulate);
	}
	function selectRID(d,i){
		d3.selectAll("td.tid").classed("highlight", false);
		d3.selectAll("td.rid").classed("highlight", true);
	//	var s = d3.select(this).attr("current_source");
	//	load_data(s,"region",tabulate);
	}


	// finally, the exit selection:
	rows.exit().remove(); 



	create_scatterplot_axes(data,yScale,xScale,cdo.err,cdo.est);
/*	*/
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


}
//load_data(1,"tract",tabulate);





/* 
 *	Create axes and labels
 *	@param {Array} data - the array of objects
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
			.tickSizeOuter(1000)
			.tickPadding(10)
	;
	// add X axis properties
	d3.select(".svgHeader svg").append("g")	
		.attr("class", "x axis tableText")
		.attr("transform", "translate(" + 0 + ","+ (25) +")")
	;
	// update axis	
	d3.select(".x.axis").transition().duration(500).call(xAxis); 



	var xAxisTicks = d3.axisTop()
		.scale(xScale)
			.ticks(ticks)		
			.tickSizeInner(-height)
			.tickSizeOuter(1000)
			.tickPadding(10)
			.tickFormat(function (d) { return ''; });
	;
//xAxisTicks.selectAll("text").remove();

	d3.selectAll(".svgCell svg")	
		.attr("class", "x3 axis3 ")
		.attr("transform", "translate(" + 0 + ","+ (25) +")")
	;
	d3.selectAll(".x3.axis3").transition().duration(500).call(xAxisTicks); 



}


