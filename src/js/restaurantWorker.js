importScripts('/src/js/apihelper.js',
	'/src/js/dbhelper.js');

self.onmessage = msg => {
	const data = msg.data;
	switch(data.action){
		case 'getRestaurants':
			getRestaurants(data.filter);
			break;
		case 'getRestaurant':
			getRestaurant(data.id);
			break;
	}
}
getRestaurants = filter => {
	APIHelper.getRestaurant().then((restaurants) => {
		const filteredRestaurants = filterRestaurants(restaurants, filter);
	self.postMessage({retrieved: 'restaurants', msgData: filteredRestaurants});
	});
}

getRestaurant = id => {
	APIHelper.getRestaurant(id).then(restaurant =>{
		self.postMessage({retrieved: 'restaurant', msgData: restaurant});
	});
}

filterRestaurants = (restaurants, filter) => {
	let results = restaurants;
	if(filter.cuisine != 'all')
		results = results.filter(r => r.cuisine_type == filter.cuisine);
	if(filter.neighborhood != 'all')
		results = results.filter(r => r.neighborhood == filter.neighborhood);
	return results;
}