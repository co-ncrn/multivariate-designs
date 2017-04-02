/**
 *	Globals file
 */
 
'use strict';



// all the scenarios and their datatypes, for validation
const scenariosData = {
	"gen": ["occupied","married","bachdeg","samehous","white","black","hisp","under18","65over","avgrooms","avghhinc","pphh"],
	"hous": ["occupied","pctown","pctrent","snglfmly","avgrooms","avghmval","avgrent"],
	"pov": ["chabvpov","abvpov","employed","hsincown","hsincrent"],
	"trans": ["drvlone","transit","vehiclpp","avgcmmte"]
};

// all the scenarios (top level of above object)
const scenarios = Object.keys(scenariosData);


// return scenarios
exports.getScenariosData = function (){
	return scenariosData;
}

exports.getScenarios = function (){
	return scenarios;
}
