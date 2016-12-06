"use strict";






/**
 *	Load a remote CSV file
 */
function load_csv(file,callback){
	$.ajax({
        type: "GET",
        url: file,
        dataType: "text",
        success: function(data) { callback(data); }
     });
}


/**
 *	Return all the keys from an array
 */
function return_keys(data){
	var keys = [];
	for(var k in data[0]) keys.push(k);
	return keys;
}



/**
 *	Remove rows with <removestr> from data
 */
function remove_rows(data,removestr){

	var fixeddata = [];
	for (var i in data){
		var keep = true;
		for (var j in data[i]){
			if (data[i][j] == removestr) {
				keep = false;
				break;
			}
		}
		if (keep ==  true) fixeddata.push(data[i])
	}
	return fixeddata;
}


/**
 *	Display CSV table in HTML
 */
function display_table(arr,id,limit){

	var str = '<table class="table table-condensed">';

	// for each row
	$.each(arr, function( index, row ) {
		// confine to limit
		if (index <= limit){

			//console.log(row);

			// create headers with keys on first row only
			if (index === 0){ 
				str += "<thead><th>#</th>";
				$.each(row, function( key, header ) {
					str += "<th>"+ key +"</th>"
				});
				str += "</thead>"
			}
			
			// all other rows
			str += "<tr><td>"+ index +"</td>";
			$.each(row, function( key, val ) {
				str += "<td>"+ val +"</td>"
			});
			str += "</tr>"

		} else {
			return false;
		}
		
	});
	$("#"+id).html(str +'</table>');
}



// colores usados por Google en sus graficos, trends, etc.
function colores_google(n=11) {
	var c = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", 
			 "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
	return c[n % c.length];
}