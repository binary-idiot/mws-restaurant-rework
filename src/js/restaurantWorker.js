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
			let updatedRestaurants = [];

			// If restaurants are retrieved from api check to see if they are newer than those in the db
			if(newRestaurants){

				for(newRestaurant of newRestaurants) {
					let restaurantFound = false;

					// If there are no restaurants retrieved from the db then skip checking and add them to updatedRestaurants
					if(restaurants){
						for(restaurant of restaurants) {
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

			// If there are any outdated restaurants in the db send the new list to the main thread then update the db
			if(updatedRestaurants.length != 0){

				console.log(`${updatedRestaurants.length} restaurnts are outdated, updating...`);
				const filteredRestaurants = filterRestaurants(newRestaurants, filter);
				self.postMessage({retrieved: 'restaurants', msgData: filteredRestaurants});

				for(restaurant of updatedRestaurants) {
					DBHelper.storeRestaurant(restaurant);
				}
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

			// If restaurant is retrieved from api check to see if its newer than the one in the db
			if(newRestaurant){
				let updateRestaurant = true;

				if(restaurant && (restaurant.updatedAt >= newRestaurant.updatedAt)){
					updateRestaurant = false;
				}

				// If restaurant is outdated then send it to the main thread and update the db
				if(updateRestaurant){
					console.log(`Restaurant ${id} outdated, Updating...`);
					self.postMessage({retrieved: 'restaurant', msgData: newRestaurant});
					DBHelper.storeRestaurant(newRestaurant);
				}
			}

		})
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