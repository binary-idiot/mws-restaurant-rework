let restaurant,
	worker,
	id,
	reviews;

var newMap;

	document.addEventListener('DOMContentLoaded', event => {
		SWHelper.registerServiceWorker();

		this.reviews = [];

		// worker to handle all restaurant retrieval
		this.worker = new Worker('/src/js/restaurantWorker.js');
		this.worker.onmessage = handleWorkerMessage;

		this.id = Helper.getParameterByName('id');
		requestAnimationFrame(initReviews);
		getRestaurant(this.id);
		getReviews(this.id);
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
		case 'restaurantReviews':
			addReviews(content);
			requestAnimationFrame(resetReviews);
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
 * Setup initial review container
 */
initReviews = () => {
	const container = document.getElementById('reviews-container');
	const title = document.createElement('h3');
	title.innerHTML = 'Reviews';
	container.appendChild(title);
}

/**
 * Have the worker retrieve a restaurant
 * @param  {RestaurantWorker} worker worker to handle request
 * @param  {Int} id     id of restaurant to retrieve
 */
getRestaurant = (id, worker = self.worker) => {
	worker.postMessage({action: 'getRestaurant', id: id});
}

getReviews = (id, worker = self.worker) => {
	worker.postMessage({action: 'getRestaurantReviews', id: id});
}

/**
 * Add or update self.reviews
 * @param  {Json} newReviews Restaurants to add
 */
addReviews = newReviews => {

	for(newReview of newReviews){
		let reviewFound = false;

		// if review is already in self.reviews then update it otherwise add it to the list;
		for([index, review] of self.reviews.entries()){
			if(review.id == newReview.id){
				reviewFound = true;
				self.reviews[index] = newReview;
				break;
			}
		}

		if(!reviewFound){
			self.reviews.push(newReview);
		}
	}

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

/**
 * Add reviews to page
 */
fillReviewHTML = () => {
	const reviews = self.reviews;
	const container = document.getElementById('reviews-container');
	
	if (reviews.length == 0) {
		const noReviews = document.createElement('p');
		noReviews.innerHTML = 'No reviews yet!';
		container.appendChild(noReviews);
		return;
	}
	const ul = document.getElementById('reviews-list');
	for(review of reviews){
		ul.appendChild(createReviewHTML(review));
	}
	container.appendChild(ul);

}

/**
 * Reset the review container
 */
resetReviews = () => {

	const noReviews = document.getElementById('no-reviews');
	if(noReviews)
		noReviews.remove();

	const ul = document.getElementById('reviews-list');
	ul.innerHTML = '';

	fillReviewHTML();
}

/**
 * Create review item
 * @param  {Json} review The review to create
 * @return {HTML}        A li of the review
 */
createReviewHTML = (review) => {

	const li = document.createElement('li');

	const header = document.createElement('div');
	header.classList.add("review-header");

	const name = document.createElement('p');
	name.innerHTML = review.name;
	name.classList.add('review-name');
	header.appendChild(name);

	const date = document.createElement('p');
	const dateMili = new Date(review.updatedAt); // Date is in milliseconds
	const dateString = dateMili.toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'});
	date.innerHTML = dateString;
	date.classList.add('review-date');
	header.appendChild(date);

	const content = document.createElement('div');
	content.classList.add("review-content");

	const rating = document.createElement('p');
	rating.innerHTML = `Rating: ${review.rating}`;
	rating.classList.add('review-rating');
	content.appendChild(rating);

	const comments = document.createElement('p');
	comments.innerHTML = review.comments;
	comments.classList.add('review-comments');
	content.appendChild(comments);

	li.appendChild(header);
	li.appendChild(content);

	return li;
}