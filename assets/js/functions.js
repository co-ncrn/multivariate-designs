





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

