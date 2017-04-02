

console.log("globals.js included")


// all the scenarios and their datatypes, for validation
const scenarios_data = {
	"gen": ["occupied","married","bachdeg","samehous","white","black","hisp","under18","65over","avgrooms","avghhinc","pphh"],
	"hous": ["occupied","pctown","pctrent","snglfmly","avgrooms","avghmval","avgrent"],
	"pov": ["chabvpov","abvpov","employed","hsincown","hsincrent"],
	"trans": ["drvlone","transit","vehiclpp","avgcmmte"]
};



//var scenarios = ["gen","hous","pov","trans"];
const scenarios = Object.keys(scenarios_data);

//console.log(scenarios_data)


exports.getScenariosData = function (){
	return scenarios_data;
}

exports.getScenariosKeys = function (){
	return scenarios;
}
