

// names of all the data types
var dataDict = {
	"gen":"General",
	"hous":"Housing",
	"pov":"Poverty",
	"trans":"Transportation",
	"avgrooms":"Average rooms per housing unit",
	"avghhinc":"Average household income",
	"pphh":"Average persons per household",
	"occupied":"Percent of housing units occupied",
	"married":"Percent of households with married-couple family",
	"bachdeg":"Percent of population age 25+ with bachelor's degree or higher ",
	"samehous":"Percent of population that lived in the same house 1 year ago",
	"white":"Percent of population non-Hispanic white",
	"black":"Percent of population non-Hispanic black",
	"hisp":"Percent of population Hispanic",
	"under18":"Percent of population under 18",
	"65over":"Percent of population over 65",
	"pop":"Total population",
	"hsincown":"Housing cost to income ratio - owners (annual)",
	"hsincrent":"Housing cost to income ratio - renters (annual)", 
	"chabvpov":"Percent of children above poverty",
	"abvpov":"Percent of population above poverty",
	"employed":"Percent of population employed",
	"pop":"Total population",
	"vehiclpp":"Vehicles per person",
	"avgcmmte":"Average travel time to work",
	"drvlone":"Percent of population who drove to work alone",
	"transit":"Perecent of population who take public transit to work",
	"pop":"Total population",
	"avgrooms":"Average rooms per housing unit",
	"avghmval":"Average home value of owner-occupied units",
	"avgrent":"Average rent",
	"occupied":"Percent of housing units occupied",
	"pctown":"Percent of housing units owner-occupied",
	"pctrent":"Percent of housing units renter-occupied",
	"snglfmly":"Percent of housing units that are single detached units",
	"pop":"Total population"
}

// scenarios -> [data types]
var scenarios_data = {
	"gen": ["occupied","married","bachdeg","samehous","white","black","hisp","under18","65over","avgrooms","avghhinc","pphh"],
	"hous": ["occupied","pctown","pctrent","snglfmly","avgrooms","avghmval","avgrent"],
	"pov": ["chabvpov","abvpov","employed","hsincown","hsincrent"],
	"trans": ["drvlone","transit","vehiclpp","avgcmmte"]
};