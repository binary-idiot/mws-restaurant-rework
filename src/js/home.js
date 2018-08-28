let restaurants,
	neighborhoods,
	cuisines,
	worker;

	document.addEventListener('DOMContentLoaded', event => {
		// worker to handle all restaurant retrieval
		this.worker = new Worker('js/restaurantWorker.js');
		this.worker.onmessage = handleWorkerMessage;
		updateRestaurants();
		getNeighborhoodsAndCuisines();
	});

/**
 * Handle messages from worker thread
 * @param  {Message} msg Message from worker
 */
handleWorkerMessage = msg => {
	const data = msg.data;
	const content = data.msgData;

	switch(data.retrieved){
		case 'restaurants':
			self.restaurants = content;
			requestAnimationFrame(fillRestaurantsHTML);

			break;
		case 'neighborhoodsAndCuisines':
			self.neighborhoods = content.neighborhoods;
			requestAnimationFrame(fillNeighborhoodHTML);
			self.cuisines = content.cuisines;
			requestAnimationFrame(fillCuisineHTML);
			break;
	}
}

/**
 * Have the worker retrieve restaurants based on filter criteria
 * @param {RestaurantWorker} worker worker to handle request
 * @param {Json} filter criteria to filter restaurants by
 */
getRestaurants = (filter, worker = this.worker) => {
	worker.postMessage({action: 'getRestaurants', filter: filter});
}

/**
 * Have the worker retrieve all neighborhoods and cuisines
 * @param  {RestaurantWorker} worker worker to handle request
 */
getNeighborhoodsAndCuisines = (worker = this.worker) => {
	worker.postMessage({action: 'getNeighborhoodsAndCuisines'});
}

/**
 * Send selected neighborhood and cuisine to getRestaurants()
 */
updateRestaurants = () => {
	const cSelect = document.getElementById('cuisines-select');
	const nSelect = document.getElementById('neighborhoods-select');

	const cIndex = cSelect.selectedIndex;
	const nIndex = nSelect.selectedIndex;

	const cuisine = cSelect[cIndex].value;
	const neighborhood = nSelect[nIndex].value;

	getRestaurants({neighborhood: neighborhood, cuisine: cuisine});
}

/**
 * Fill neighborhoods-select with retrieved neighborhoods
 */
fillNeighborhoodHTML = () => {
	const select = document.getElementById('neighborhoods-select');
	for(neighborhood of self.neighborhoods){
		const option = document.createElement('option');
		option.innerHTML = neighborhood;
		option.value = neighborhood;
		select.append(option);
	}
}

/**
 * Fill cuisines-select with retrieved cuisines
 */
fillCuisineHTML = () => {
	const select = document.getElementById('cuisines-select');
	for(cuisine of self.cuisines){
		const option = document.createElement('option');
		option.innerHTML = cuisine;
		option.value = cuisine;
		select.append(option);
	}
}

/**
 * Fill restaurants-list with retrieved restaurants
 */
fillRestaurantsHTML = () => {
	const ul = document.getElementById('restaurants-list');
	resetRestaurants(ul);

	for(restaurant of self.restaurants)
		ul.append(createRestaurantHTML(restaurant));
	// map markers
}

/**
 * Clear existing restaurants from page
 */
resetRestaurants = ul => {
	ul.innerHTML = '';

	// map markers
	
}

/**
 * Create a li for a restaurant
 * @param  {Json} restaurant Restaurant to create
 * @return {HTML}            li for restaurant
 */
createRestaurantHTML = restaurant => {
	const li = document.createElement('li');

	const image = document.createElement('img');
	const imgSrc = Helper.imageUrlForRestaurant(restaurant); 
	image.className = 'restaurant-img';
	image.src = `${ imgSrc }-small.jpg`;
	image.srcset = `${ imgSrc }-small.jpg 300w, ${ imgSrc }-medium.jpg 600w, ${ imgSrc }-large.jpg 800w`;
	image.sizes = '(max-width: 424px) 300px, (max-width: 573px) 449px, 300px';
	image.alt = restaurant.alt;
	li.append(image);

	const name = document.createElement('h2');
	name.innerHTML = restaurant.name;
	li.append(name);

	const neighborhood = document.createElement('p');
	neighborhood.innerHTML = restaurant.neighborhood;
	li.append(neighborhood);

	const address = document.createElement('p');
	const adr = restaurant.address.replace(/,/, ',<br>');
	address.innerHTML = adr;
	li.append(address);

	const more = document.createElement('a');
	more.innerHTML = 'View Details';
	more.href = Helper.urlForRestaurant(restaurant);
	more.setAttribute('role', 'button')
	li.append(more)

	return li
}