let restaurant,
	review,
	worker,
	id;

	document.addEventListener('DOMContentLoaded', event =>{
		SWHelper.registerServiceWorker();

		const restaurant_id = Helper.getParameterByName('restaurant');
		this.id = Helper.getParameterByName('id');

		this.worker = new Worker('/js/restaurantWorker.js');
		this.worker.onmessage = handleWorkerMessage;

		getRestaurant(restaurant_id);

		if(this.id)
			getReview(this.id);
		
		requestAnimationFrame(fillFormTitle);
	})

	handleWorkerMessage = msg => {
		const data = msg.data;
		const content = data.msgData;

		switch(data.retrieved){
			case 'restaurant':
				self.restaurant = content;
				requestAnimationFrame(fillBreadcrumb);
				requestAnimationFrame(fillRestaurantName);
				break;
			case 'review':
				self.review = content;
				requestAnimationFrame(fillReviewForm);
				break;
		}
	}

	getRestaurant = (id, worker = self.worker) => {
		worker.postMessage({action: 'getRestaurant', id:id})
	}

	getReview = (id, worker = self.worker) =>{
		worker.postMessage({action:'getReview', id:id});
	}
	
	fillRestaurantName = () => {
		const name = document.getElementById('restaurant-name');
		name.innerHTML = this.restaurant.name;
	}

	fillFormTitle = () => {
		const title = document.getElementById('form-title');
		const type = (this.id) ? 'Update' : 'Create';

		title.innerHTML = `${type} review`;

	}

	fillReviewForm = () => {
		const review = this.review;

		const name = document.getElementById('review-name');
		name.value = review.name;

		const rating = document.getElementById('review-rating');
		rating.value = review.rating;

		const comments = document.getElementById('review-comments');
		comments.value = review.comments;
	}

	fillBreadcrumb = () => {
	const restaurant = self.restaurant;

	const breadcrumb = document.getElementById('breadcrumb');
	const liRestaurant = document.createElement('li');

	const aRestaurant = document.createElement('a');
	aRestaurant.href = Helper.urlForRestaurant(restaurant);
	aRestaurant.innerHTML = restaurant.name;

	liRestaurant.appendChild(aRestaurant);

	breadcrumb.appendChild(liRestaurant);

	const liReview = document.createElement('li');
	liReview.innerHTML = 'Review';

	breadcrumb.appendChild(liReview);

}