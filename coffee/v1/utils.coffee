arrayToObject = (arr) ->
	dict = {}
	dict[val] = arr[1][key] for val,key in arr[0] when arr[1][key]
	return dict