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
	DBHelper.getRestaurant().then((restaurants) => {
		let newRestaurants;
		
		if(restaurants){
			const filteredRestaurants = filterRestaurants(restaurants, filter);
			self.postMessage({retrieved: 'restaurants', msgData: filteredRestaurants});
		}

		APIHelper.getRestaurant().then(nr => {
			newRestaurants = nr;
			let updatedRestaurants = [];

			if(newRestaurants){

				for(newRestaurant of newRestaurants) {
					let restaurantFound = false;

					if(restaurants){
						for(restaurant of restaurants) {
							if(restaurant.updatedAt === newRestaurant.updatedAt){
								restaurantFound = true;
								break;
							}
						}
					}

					if(!restaurantFound){
						updatedRestaurants.push(newRestaurant);
					}
				}
			}

			return updatedRestaurants;
		}).then(updatedRestaurants => {
			if(updatedRestaurants.length != 0){

				const filteredRestaurants = filterRestaurants(newRestaurants, filter);
				self.postMessage({retrieved: 'restaurants', msgData: filteredRestaurants});

				for(restaurant of updatedRestaurants) {
					DBHelper.storeRestaurant(restaurant);
				}
			}
		});

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