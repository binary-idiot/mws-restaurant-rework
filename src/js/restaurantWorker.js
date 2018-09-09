importScripts('/js/apihelper.js',
	'/js/dbhelper.js');
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
		case 'getRestaurantReviews':
			getRestaurantReviews(data.id);
			break;
		case 'getReview':
			getReview(data.id);
			break;
		case 'createReview':
			createReview(data.review);
			break;
		case 'updateReview':
			updateReview(data.id, data.review);
	}
}

/**
 * Fetch restaurants and update local db if out of date
 * @param  {Json} filter criteria to filter restaurants by before sending back to main thread
 */
getRestaurants = filter => {
	DBHelper.getRestaurant().then((dbRestaurants) => {
		
		// If restaurants are retrieved from the db filter them and send them to the main thread
		if(dbRestaurants){
			
			console.log(`${dbRestaurants.length} restaurants found in db`);
			const filteredRestaurants = filterRestaurants(dbRestaurants, filter);
			self.postMessage({retrieved: 'restaurants', msgData: filteredRestaurants});
		}

		APIHelper.getRestaurant().then(apiRestaurants => {
			
			const updatedRestaurants = updateRestaurants(dbRestaurants, apiRestaurants);

			if(updatedRestaurants){
				const filteredRestaurants = filterRestaurants(updatedRestaurants, filter);
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
 * Retrieve all reviews for a restaurant
 * @param  {int} id Id of restaurant
 */
getRestaurantReviews = id => {
	DBHelper.getRestaurantReviews(id).then(dbReviews => {

		if(dbReviews){
			console.log(`${dbReviews.length} reviews for restaurant ${id} found in db`);

			self.postMessage({retrieved: 'restaurantReviews', msgData: dbReviews});
		}

		APIHelper.getReview(id, true).then(apiReviews => {
			const updatedReviews = updateReviewsDB(dbReviews, apiReviews);

			if(updatedReviews){
				self.postMessage({retrieved: 'restaurantReviews', msgData: updatedReviews});
			}
		})
	})
}

/**
 * Retrieve review
 * @param  {int} id Id of review to retrieve
 */
getReview = id => {
	DBHelper.getReview(id).then(dbReview => {

		if(dbReview){
			console.log(`Review ${id} found in db`);

			self.postMessage({retrieved: 'review', msgData: dbReview});
		}

		APIHelper.getReview(id).then(apiReview => {
			const updatedReview = updateReviewDB(dbReview, apiReview);

			if(updatedReview){
				self.postMessage({retrieved: 'review', msgData:apiReview});
			}
		})
	})
}

createReview = review => {
	//TODO: add reviews to unsynced db then try and upload to api,
	//	if api post is successful reload restaurants
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
 * Check if restaurants are out of date and if they are update the db
 * @param  {Json} dbRestaurants Restaurants retrieved from db
 * @param  {Json} apiRestaurants Restaurants retrieved from api
 * @return {Json}               Returns updatedRestaurants
 */
updateRestaurants = (dbRestaurants, apiRestaurants) => {

	let updatedRestaurants = [];

	// If restaurants are retrieved from api check to see if they are newer than those in the db
	if(apiRestaurants){

		for(apiRestaurant of apiRestaurants) {
			let restaurantFound = false;

			// If there are no restaurants retrieved from the db then skip checking and add them to updatedRestaurants
			if(dbRestaurants){
				for(restaurant of dbRestaurants) {

					// If restaurant is found then check to see if its up to date
					if(restaurant.id == apiRestaurant.id){
						if(restaurant.updatedAt >= apiRestaurant.updatedAt){
							restaurantFound = true;
							break;
						}
					}

				}
			}

			// If updated restaurant isnt found add it to the list of restaurants to update
			if(!restaurantFound){
				updatedRestaurants.push(apiRestaurant);
			}
		}
	}

	// If there are any outdated restaurants in the db update and return them
	if(updatedRestaurants.length != 0){

		console.log(`${updatedRestaurants.length} restaurants are outdated, updating...`);

		for(restaurant of updatedRestaurants) {
			DBHelper.storeRestaurant(restaurant);
		}

		return updatedRestaurants;
	}

	return null;

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

/**
 * Check if reviews are out of date and if they are update the db
 * @param  {Json} dbReviews Reviews retrieved from db
 * @param  {Json} apiReviews Reviews retrieved from api
 * @return {Array}               Returns updatedReviews
 */
updateReviewsDB = (dbReviews, apiReviews) => {
	let updatedReviews = [];

	// If reviews are retrieved from api check to see if they are newer than those in the db
	if(apiReviews){

		for(apiReview of apiReviews){
			let reviewFound = false;

			// If there are no reviews retrieved from the db then skip checking and add them to updatedReviews
			if(dbReviews){
				for(dbReview of dbReviews){

					// If review is found then check to see if its up to date
					if(dbReview.id == apiReview.id){
						if(dbReview.updatedAt >= apiReview.updatedAt){
							reviewFound = true;
							break;
						}
					}

				}
			}

			// If updated review isnt found add it to the list of reviews to update
			if(!reviewFound){
				updatedReviews.push(apiReview);
			}
		}

	}

	// If there are any outdated reviews in the db update and return them
	if(updatedReviews != 0){
		console.log(`${updatedReviews.length} reviews are outdated, updating...`);

		for(review of updatedReviews){
			DBHelper.storeReview(review);
		}

		return updatedReviews;
	}

	return null;

}


/**
 * Check if review is out of date and if it is update the db
 * @param  {Json} dbReview Review retrieved from db
 * @param  {Json} apiReview Review retrieved from api
 * @return {Boolean}               Returns true if dbReview was out of date
 */
updateReviewDB = (dbReview, apiReview) => {

	if(apiReview){
		let updateReview = true;

		if(dbReview && (dbReview.updatedAt >= apiReview.updatedAt)){
			updateReview = false;
		}

		if(updateReview){
			console.log(`Review ${apiReview.id} outdated, Updating...`);
			DBHelper.storeReview(apiReview);

			return true;
		}

		return false;
	}
}