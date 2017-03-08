

# API NOTES

accept calls
	get all data for an MSA + scenario
		https://domain.com/api/msa/10180/gen/
		https://domain.com/api/msa/{msa}/{scenario}/

	get all data for a tract
		https://domain.com/api/tract/g48441012300/gen/
		https://domain.com/api/tract/{tid}/{scenario}/

join the correct tables
	10180_gen_crosswalk
	10180_gen_input_tracts
	10180_gen_output_regions

reply
	{ }




Size of all CSV in MySQL = 246 MB
http://stackoverflow.com/questions/14714750/how-to-get-true-size-of-mysql-database