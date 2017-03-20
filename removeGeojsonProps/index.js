


/**
 *	Remove unwanted geojson feature properties
 */

var fs = require('fs');


function editFunct(feature){
	feature.TID = feature.properties.TID;					// set the TID in the feature
	feature.properties.lat = feature.properties.INTPTLAT;	// shorten lat name
	feature.properties.lng = feature.properties.INTPTLON;	// shorten lng name
	return feature;
}
var inputFile = '../data/geojson/16740_tract.geojson',
	outputFile = '../data/geojson/16740_tract3-clean.geojson',
	remove = [
	// remove appearance information
	"fill","fill-opacity","stroke","stroke-opacity","stroke-width",
	// remove extra codes https://www2.census.gov/geo/docs/maps-data/data/tiger/prejoined/ACSMetadata2011.txt
	"STATEFP","COUNTYFP","TRACTCE","MTFCC","NAMELSAD","FUNCSTAT",

	// gen
	"65overCV","65overE","65overM","INTPTLAT","INTPTLON","NAME","RID","TID","avghhincCV","avghhincE","avghhincM","avgroomsCV","avgroomsM",
	"bachdegCV","bachdegE","bachdegM","blackCV","blackE","blackM","code","hispCV","hispE","hispM","marriedCV","marriedE","marriedM",
	"occupiedCV","occupiedE","occupiedM","pphhCV","pphhE","pphhM","samehousCV","samehousE","samehousM","under18CV","under18E","under18M",
	"whiteCV","whiteE","whiteM"
	//,"avgroomsE"
];


inputFile = "../data/geojson/25860_tract.geojson";
outputFile = "../data/geojson/25860_tract_clean.geojson";


/*
// MSA LAYER
function editFunct(feature){
	feature.properties.lat = feature.properties.INTPTLAT;	// shorten lat name
	feature.properties.lng = feature.properties.INTPTLON;	// shorten lng name
	return feature;
}
inputFile = "../data/geojson/msa_2013_qgis.geojson";
outputFile = "../data/geojson/msa_2013_qgis_remover.geojson";
remove = ["CSAFP","CBSAFP","NAMELSAD","LSAD","MEMI","MTFCC","ALAND","AWATER","GISJOIN","SHAPE_AREA","SHAPE_LEN","INTPTLAT","INTPTLON"];
*/






removeGeojsonProps(inputFile,outputFile,remove,editFunct);



function removeGeojsonProps(inputFile,outputFile,remove,editFunct){

	// import geojson
	var geojson = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

	// for each feature in geojson
	geojson.features.forEach(function(feature,i){

		// edit any properties
		feature = editFunct(feature);

		//console.log(feature);

		// remove any you don't want
		for (var key in feature.properties) {	
		
			// remove unwanted properties
			if ( key.charAt(0) == "B" || remove.indexOf(key) !== -1 ){
				delete feature.properties[key];
			}
		}
		console.log(feature);
		//console.log(feature.geometry.coordinates[0]);
	});

	// write file
	fs.writeFile(outputFile, JSON.stringify(geojson), function(err) {
	    if(err) return console.log(err);
	    console.log("The file was saved!");
	}); 
}


