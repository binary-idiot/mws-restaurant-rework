importScripts('/src/js/apihelper.js',
	'/src/js/dbhelper.js');
/**
 * Handle message from  main thread
 * @param  {Message} msg Message from main thread
 */
self.onmessage = msg => {
	const data = msg.data;
	switch(data.action){
		case 'getRestaurants':
			getRestaurants(data.filter);
			break;
		case 'getRestaurant':
			getRestaurant(data.id);
			break;
		case 'getNeighborhoodsAndCuisines':
			getNeighborhoodsAndCuisines();
			break;
	}
}

/**
 * Fetch restaurants and update local db if out of date
 * @param  {Json} filter criteria to filter restaurants by before sending back to main thread
 */
getRestaurants = filter => {
	DBHelper.getRestaurant().then((restaurants) => {
		
		// If restaurants are retrieved from the db filter them and send them to the main thread
		if(restaurants){
			
			console.log(`${restaurants.length} restaurants found in db`);
			const filteredRestaurants = filterRestaurants(restaurants, filter);
			self.postMessage({retrieved: 'restaurants', msgData: filteredRestaurants});
		}

		APIHelper.getRestaurant().then(newRestaurants => {
			
			const restaurantsUpdated = updateRestaurants(restaurants, newRestaurants);

			if(restaurantsUpdated){
				const filteredRestaurants = filterRestaurants(newRestaurants, filter);
				self.postMessage({retrieved: 'restaurants', msgData: filteredRestaurants});
			}
		});

	});
}

/**
 * Fetch a restaurant and update the local db if out of date
 * @param  {Int} id the id of the restaurant to fetch
 */
getRestaurant = id => {
	DBHelper.getRestaurant(id).then(restaurant =>{

		// If restaurant is retrieved from db then send it to the main thread
		if(restaurant){
			console.log(`Restaurant ${id} found in db`);
			self.postMessage({retrieved: 'restaurant', msgData: restaurant});
		}

		APIHelper.getRestaurant(id).then(newRestaurant => {
			const restaurantUpdated = updateRestaurant(restaurant, newRestaurant);

			if(restaurantUpdated){
				self.postMessage({retrieved: 'restaurant', msgData: newRestaurant});
			}

		})
	});
}

/**
 * Retrieve all neighborhoods and cuisines from restaurants and send them back to the main thread
 */
getNeighborhoodsAndCuisines = () => {
	DBHelper.getRestaurant().then(restaurants => {
		if(restaurants){
			const neighborhoodsAndCuisines = {neighborhoods: extractNeighborhoods(restaurants), cuisines: extractCuisines(restaurants)};
			console.log(`Found ${neighborhoodsAndCuisines.neighborhoods.length} neighborhoods and ${neighborhoodsAndCuisines.cuisines.length} cuisines in db.`);
			self.postMessage({retrieved: 'neighborhoodsAndCuisines', msgData: neighborhoodsAndCuisines});
		}

		APIHelper.getRestaurant().then(newRestaurants => {

			const updatedRestaurants = updateRestaurants(restaurants, newRestaurants);

			if(updatedRestaurants){
				const neighborhoodsAndCuisines = {neighborhoods: extractNeighborhoods(newRestaurants), cuisines: extractCuisines(newRestaurants)};
				console.log(`Found ${neighborhoodsAndCuisines.neighborhoods.length} neighborhoods and ${neighborhoodsAndCuisines.cuisines.length} cuisines from api.`);
				self.postMessage({retrieved: 'neighborhoodsAndCuisines', msgData: neighborhoodsAndCuisines});
			}
		});
	});
}

/**
 * Filter restaurants by cuisine and neighborhood
 * @param  {Json} restaurants list of restaurants to filter
 * @param  {Json} filter      criteria to filter by
 */
filterRestaurants = (restaurants, filter) => {
	let results = restaurants;
	if(filter.cuisine != 'all')
		results = results.filter(r => r.cuisine_type == filter.cuisine);
	if(filter.neighborhood != 'all')
		results = results.filter(r => r.neighborhood == filter.neighborhood);
	console.log(`${results.length} restaurants match filter`);
	return results;
}

/**
 * Extract neighborhoods from restaurants
 * @param  {Json} restaurants Restaurants to extract neighborhoods from from
 * @return {String}             Array of all neighborhoods
 */
extractNeighborhoods = restaurants => {
	const neighborhoods = restaurants.map((v,i) => restaurants[i].neighborhood);
	const uniqueNeighborhoods = neighborhoods.filter((v,i) => neighborhoods.indexOf(v) == i);

	return uniqueNeighborhoods;
}

/**
 * Extract cuisines from restaurants
 * @param  {Json} restaurants Restaurants to extract cuisines from from
 * @return {String}             Array of all cuisines
 */
extractCuisines = restaurants => {
	const cuisines = restaurants.map((v,i) => restaurants[i].cuisine_type);
	const uniqueCuisines = cuisines.filter((v,i) => cuisines.indexOf(v) == i);

	return uniqueCuisines;
}

/**
 * Check if oldRestaurants are out of date and if they are update the db
 * @param  {Json} oldRestaurants Restaurants retrieved from db
 * @param  {Json} newRestaurants Restaurants retrieved from api
 * @return {Boolean}               Returns true if oldRestaurants were out of date
 */
updateRestaurants = (oldRestaurants, newRestaurants) => {

	let updatedRestaurants = [];

	// If restaurants are retrieved from api check to see if they are newer than those in the db
	if(newRestaurants){

		for(newRestaurant of newRestaurants) {
			let restaurantFound = false;

			// If there are no restaurants retrieved from the db then skip checking and add them to updatedRestaurants
			if(oldRestaurants){
				for(restaurant of oldRestaurants) {
					if(restaurant.updatedAt >= newRestaurant.updatedAt){
						restaurantFound = true;
						break;
					}
				}
			}

			// If restaurant isnt found add it to the list of restaurants to update
			if(!restaurantFound){
				updatedRestaurants.push(newRestaurant);
			}
		}
	}

	// If there are any outdated restaurants in the db update and return true else return false
	if(updatedRestaurants.length != 0){

		console.log(`${updatedRestaurants.length} restaurants are outdated, updating...`);

		for(restaurant of updatedRestaurants) {
			DBHelper.storeRestaurant(restaurant);
		}

		return true;
	}

	return false;

}

/**
 * Check if oldRestaurant is out of date and if it is update the db
 * @param  {Json} oldRestaurant Restaurant retrieved from db
 * @param  {Json} newRestaurant Restaurant retrieved from api
 * @return {Boolean}               Returns true if oldRestaurant was out of date
 */
updateRestaurant = (oldRestaurant, newRestaurant) => {
	// If restaurant is retrieved from api check to see if its newer than the one in the db
	if(newRestaurant){
		let updateRestaurant = true;

		if(oldRestaurant && (oldRestaurant.updatedAt >= newRestaurant.updatedAt)){
			updateRestaurant = false;
		}

		// If restaurant is outdated then send it to the main thread and update the db
		if(updateRestaurant){
			console.log(`Restaurant ${newRestaurant.id} outdated, Updating...`);
			DBHelper.storeRestaurant(newRestaurant);

			return true;
		}

		return false;
	}
}