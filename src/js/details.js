let restaurant,
	worker;

var newMap;

	document.addEventListener('DOMContentLoaded', event => {
		// worker to handle all restaurant retrieval
		this.worker = new Worker('/src/js/restaurantWorker.js');
		this.worker.onmessage = handleWorkerMessage;
		getRestaurant(getParameterByName('id'));
	})

/**
 * Handle messages from worker thread
 * @param  {Message} msg Message from worker thread
 */
handleWorkerMessage = msg => {
	const data = msg.data;
	const content = data.msgData;

	switch(data.retrieved){
		case 'restaurant':
			self.restaurant = content;
			requestAnimationFrame(initMap);
			requestAnimationFrame(fillRestaurantHTML);
			break;
	}
}

/**
 * Initialize mapbox map
 */
initMap = () => {
	const restaurant = self.restaurant;
	self.newMap = L.map('map', {
	    center: [restaurant.latlng.lat, restaurant.latlng.lng],
	    zoom: 16,
	    scrollWheelZoom: false
	  });
	  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
	    mapboxToken: 'pk.eyJ1IjoiYmluYXJ5aWRpb3QiLCJhIjoiY2pqMzZjNWRtMWF2YTNrbXRsb2VueGlydyJ9.mkjp31-552zW210Dz1PUcQ',
	    maxZoom: 18,
	    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
	      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
	      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
	    id: 'mapbox.streets'    
	  }).addTo(newMap);

	  Helper.mapMarkerForRestaurant(self.restaurant, self.newMap);
}

/**
 * get value of url param
 * @param  {String} name param to search for
 * @param  {String} url  url to search for
 * @return {String}      Value of param
 */
getParameterByName = (name, url) => {
  if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

/**
 * Have the worker retrieve a restaurant
 * @param  {RestaurantWorker} worker worker to handle request
 * @param  {Int} id     id of restaurant to retrieve
 */
getRestaurant = (id, worker = self.worker) => {
	worker.postMessage({action: 'getRestaurant', id: id});
}

/**
 * Fill restaurant page with restaurant data
 * @param  {Json} restaurant Restaurant to fill page with
 */
fillRestaurantHTML = () => {
	const restaurant = self.restaurant;

	const name = document.getElementById('restaurant-name');
	name.innerHTML = restaurant.name;

	const address = document.getElementById('restaurant-address');
	address.innerHTML = restaurant.address;

	const image = document.getElementById('restaurant-img');
	const imgSrc =  Helper.imageUrlForRestaurant(restaurant);
	image.className = 'restaurant-img'
	image.src = `${ imgSrc }-small.jpg`;
	image.srcset = `${ imgSrc }-small.jpg 300w, ${ imgSrc }-medium.jpg 600w, ${ imgSrc }-large.jpg 800w`;
	image.size = '(max-width: 767) calc(100% - 30px), calc(50% - 30px)';
	image.alt = restaurant.alt;

	const cuisine = document.getElementById('restaurant-cuisine');
	cuisine.innerHTML = restaurant.cuisine_type;

	// fill operating hours
	if (restaurant.operating_hours) {
	fillRestaurantHoursHTML();
	}

	// TODO: Add reviews to page
	fillBreadcrumb();
}

/**
 * Fill operating hours section
 * @param  {Json} operatingHours Operating hours to add to page
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
	const hours = document.getElementById('restaurant-hours');
	for (let key in operatingHours) {
		const row = document.createElement('tr');

		const day = document.createElement('td');
		day.innerHTML = key;
		row.appendChild(day);

		const time = document.createElement('td');
		const oh = operatingHours[key].replace(/,/, '<br>');
		time.innerHTML = oh;
		row.appendChild(time);

		hours.appendChild(row);
	}
}

/**
 * Fill page breadcrumb
 * @param  {Json} restaurant Restaurant for page
 */
fillBreadcrumb = () => {
	const restaurant = self.restaurant;

	const breadcrumb = document.getElementById('breadcrumb');
	const li = document.createElement('li');
	li.innerHTML = restaurant.name;
	breadcrumb.appendChild(li);
}