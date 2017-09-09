





function fixdata(data){
	// data fixing
	data.forEach(function(row,i) {
		console.log("fixdata() ->",sources[source],row,current);

		// remove g from TID
		data[i].TID = data[i].TID.replace("g","");


		console.log("t_"+ current.data + "E");



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
	
	if (num > 1000) {		var decimal = 1;
	} else if (num > 100){ 	var decimal = 10;
	} else if (num > 10){	var decimal = 10;
	} else if (num > 1){	var decimal = 1000;
	} else if (num > .1){ 	var decimal = 1000;
	} else if (num > .01){ 	var decimal = 1000;
	}
	num = Math.round(num * decimal) / decimal;
	return num;
}