let restaurants,
	neighborhoods,
	cuisines,
	worker;

var newMap;
var markers = [];

	document.addEventListener('DOMContentLoaded', event => {
		SWHelper.registerServiceWorker();

		// worker to handle all restaurant retrieval
		this.worker = new Worker('js/restaurantWorker.js');
		this.worker.onmessage = handleWorkerMessage;
		requestAnimationFrame(initMap);
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
			addRestaurants(content);
			requestAnimationFrame(fillRestaurantsHTML);
			break;
		case 'neighborhoodsAndCuisines':
			self.neighborhoods = content.neighborhoods;
			requestAnimationFrame(fillNeighborhoodHTML);
			self.cuisines = content.cuisines;
			requestAnimationFrame(fillCuisineHTML);
			break;
		case 'favorited':
			if(!content)
				registerSync();
			updateRestaurants();
			break;
	}
}

/**
	 * Register serviceWorker sync event
	 * @return {Promise} Resolves if registration is successful
	 */
	registerSync = () =>{
		navigator.serviceWorker.ready.then(reg => {
			return reg.sync.register('syncReviews')
		}).catch(error => {
			console.error(error);
		});
	}

/**
 * Initialize mapbox map
 */
initMap = () => {
	self.newMap = L.map('map', {
	    center: [40.722216, -73.987501],
	    zoom: 12,
	    scrollWheelZoom: false
	  });
	L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={mapboxToken}', {
	mapboxToken: 'pk.eyJ1IjoiYmluYXJ5aWRpb3QiLCJhIjoiY2traXBrb3doMHNleDJ2b2RkNG92ajVoMCJ9.G13Ie3WgGMKry_OYHfROng',
	tileSize: 512,
	maxZoom: 18,
	zoomOffset: -1,
	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
	  '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
	  'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
	id: 'mapbox.streets'
	}).addTo(newMap);
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
 * Have the worker set favorite to the other state 
 * @param  {Json} restaurant The restaurant to (un)favorite
 * @param  {RestaurantWorker} worker worker to handle request
 */
toggleFavorite = (restaurant, worker = this.worker) => {
	let state = false;
	if(restaurant.is_favorite == false || restaurant.is_favorite == "false")
		state = true;
	worker.postMessage({action: 'setFavorite', id:restaurant.id, state:state});
}

/**
 * Add or update self.restaurants
 * @param  {Json} newRestaurants Restaurants to add
 */
addRestaurants = newRestaurants => {

	for(newRestaurant of newRestaurants){
		let restaurantFound = false;

		// if restaurant is already in self.restaurants then update it otherwise add it to the list;
		for([index, restaurant] of self.restaurants.entries()){
			if(restaurant.id == newRestaurant.id){
				restaurantFound = true;
				self.restaurants[index] = newRestaurant;
				break;
			}
		}

		if(!restaurantFound){
			self.restaurants.push(newRestaurant);
		}
	}

}

/**
 * Send selected neighborhood and cuisine to getRestaurants()
 */
updateRestaurants = () => {
	resetRestaurants();

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

	for(restaurant of self.restaurants)
		ul.append(createRestaurantHTML(restaurant));
	addMarkersToMap();
}

/**
 * Clear existing restaurants from page
 */
resetRestaurants = () => {
	self.restaurants = [];

	const ul = document.getElementById('restaurants-list');
	ul.innerHTML = '';

	if(self.markers){
		for(marker of self.markers)
			marker.remove();
	}
	self.markers = [];
	
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


	const titleContainer = document.createElement('div');
	titleContainer.classList.add('restaurant-container');

	const name = document.createElement('h2');
	name.innerHTML = restaurant.name;
	titleContainer.append(name);

	const fav = document.createElement('button');
	fav.innerHTML = '★';
	fav.onclick = e => {toggleFavorite(restaurant)};
	fav.classList.add('fav-button');
	fav.setAttribute('aria-label', 'Toggle favorite');

	console.log(`restaurant ${restaurant.id} is ${restaurant.is_favorite}`);

	if(restaurant.is_favorite == true || restaurant.is_favorite == "true"){
		fav.classList.add('favorited');
		li.setAttribute('aria-label', 'Favorite Restaurant');
	}else{
		fav.classList.remove('favorited');
		li.setAttribute('aria-label', 'Restaurant');
	}

	titleContainer.append(fav);

	const neighborhood = document.createElement('p');
	neighborhood.innerHTML = restaurant.neighborhood;
	titleContainer.append(neighborhood);

	const address = document.createElement('p');
	const adr = restaurant.address.replace(/,/, ',<br>');
	address.innerHTML = adr;
	titleContainer.append(address);

	li.append(titleContainer);


	const more = document.createElement('a');
	more.innerHTML = 'View Details';
	more.href = Helper.urlForRestaurant(restaurant);
	li.append(more)

	return li
}

/**
 * Add map markers for each restaurant
 */
addMarkersToMap = () => {
	for(restaurant of self.restaurants) {
		const marker = Helper.mapMarkerForRestaurant(restaurant, self.newMap);
		marker.on("click", () => {
			window.location.href = marker.options.url;
		});
		self.markers.push(marker);
	}
}