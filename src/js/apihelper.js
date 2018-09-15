
class APIHelper{

	/**
 	* URL to restaurant API
 	*/
	static get API_URL(){
		const port = 1337;
		return `http://localhost:${port}`
	}

	/**
	 * GET restaurants from API
	 * @param  {String} query id of restaurant or a url query
	 * @return {Promise}    Promise that resolves to restaurant json from API
	 */
	static getRestaurant(query = ''){
		return fetch(`${APIHelper.API_URL}/restaurants/${query}`).then(response => {
			if(!response.ok)
				throw new Error(`Request failed. Returned status of ${response.status}`);
			return response.json();
		}).catch(error => {
			console.error(error);
		});
	}

	/**
	 * Retrive favorite restaurants by passing favorite query to getRestaurant()
	 * @return {Promise} Promise that resolves favorite restaurant json from API
	 */
	static getFavorites(){
		return getRestaurant('?is_favorite=true');
	}

	/**
	 * Retrive restaurant reviews
	 * @param  {Int}  id            Id of review or restaurant
	 * @param  {Boolean} forRestaurant If true will return all reviews for restaurant given by id
	 * @return {Promise}                Promise that resolves to review json from API
	 */
	static getReview(id = '', forRestaurant = false){
		const queryString = (forRestaurant) ? '?restaurant_id=' : '';

		return fetch(`${APIHelper.API_URL}/reviews/${queryString}${id}`).then(response => {
			if(!response.ok)
				throw new Error(`Request failed. Returned status of ${response.status}`);
			return response.json();	
		}).catch(error => {
			console.error(error);
		});
	}

	/**
	 * POST review to API
	 * @param  {Json} review Review Json
	 * @return {Boolean}	Return true if successful false if not
	 */
	static createReview(review){
		return fetch(`${APIHelper.API_URL}/reviews/`, {
			method: 'post',
			body: JSON.stringify(review)
		}).then(response => {
			if(!response.ok)
				throw new Error(`Request failed. Returned status of ${response.status}`);
			return true;
		}).catch(error => {
			console.error(error);
			return false;
		});
	}

	/**
	 * Update favorite restaurants
	 * @param  {Int} id    Id of restaurant
	 * @param  {Boolean} state State of favorite
	 * @return {Boolean}	Return true if successful false if not
	 */
	static updateFavorite(id, state){
		return fetch(`${APIHelper.API_URL}/restaurants/${id}/?is_favorite=${state}`).then(response => {
			if(!response.ok)
				throw new Error(`Request failed. Returned status of ${response.status}`);
			return true;
		}).catch(error => {
			console.error(error);
			return false
		});
	}

	/**
	 * Update exsisting review
	 * @param  {Int} id     Id of review to update
	 * @param  {Json} review Review json
	 * @return {Boolean}	Return true if successful false if not
	 */
	static updateReview(id, review){
		return fetch(`${APIHelper.API_URL}/reviews/${id}`, {
			method: 'put',
			body: JSON.stringify(review)
		}).then(response => {
			if(!response.ok)
				throw new Error(`Request failed. Returned status of ${response.status}`);
			return true;
		}).catch(error => {
			console.error(error);
			return false;
		});
	}

	/**
	 * Delete review
	 * @param  {Int} id Id of review to delete
	 * @return {Boolean}	Return true if successful false if not
	 */
	static deleteReview(id){
		return fetch(`${APIHelper.API_URL}/reviews/${id}`, {
			method: 'delete'
		}).then(response => {
			if(!response.ok)
				throw new Error(`Request failed. Returned status of ${response.status}`);
			return true;
		}).catch(error => {
			console.error(error);
			return false;
		})
	}
}
