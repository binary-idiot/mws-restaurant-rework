importScripts('https://rawgit.com/jakearchibald/idb/master/lib/idb.js')

var restaurantDb = idb.open('restaurants-db', 5, db => {
  switch(db.oldVersion){
    case 0:
    	db.createObjectStore('restaurant', {keyPath: 'id'});
    case 1:
    	db.createObjectStore('review', {keyPath: 'id'});
    case 2:
    	const reviewStore = db.transaction.objectStore('review');
    	reviewStore.createIndex('restaurant', 'restaurant_id');
    case 3:
    	db.createObjectStore('unsynced', {autoIncrement: true});
    case 4:
    	const unsyncedStore = db.transaction.objectStore('unsynced');
    	unsyncedStore.createIndex('mode', 'mode');
  }
});

class DBHelper {

	/**
	 * retrieve restaurants from db
	 * @param  {Int} id id of restaurant to retrieve, if null all restaurants will be retrieved
	 * @return {Promise}    Will resolve to an array of retrieved restaurants
	 */
	static getRestaurant(id = 0) {
		return restaurantDb.then(db => {
			const tx = db.transaction('restaurant');
			const restaurantStore = tx.objectStore('restaurant');
			let response;
			if(id != 0)
				response = restaurantStore.get(Number(id));
			else
				response = restaurantStore.getAll();
			return response;
		}).catch(error => {
			console.error(error);
		});
	}

	/**
	 * update restaurant in db
	 * @param  {Json} restaurant The restaurant data in json
	 * @return {Promise}            Resolves if restaurant is successfully updated
	 */
	static storeRestaurant(restaurant){
		return restaurantDb.then(db => {
			const tx = db.transaction('restaurant', 'readwrite');
			const restaurantStore = tx.objectStore('restaurant');
			restaurantStore.put(restaurant);
			return tx.complete;
		}).catch(error => {
			console.error(error);
		});
	}

	/**
	 * set restaurant favorite state
	 * @param {int} id    id of restaurant to update
	 * @param {Boolean} state true to favorite restaurant false to unfavorite
	 * @return {Promise}            Resolves if restaurant is successfully updated
	 */
	static setFavorite(id, state){
		return this.getRestaurant(id).then(restaurant => {
			restaurant.is_favorite = state;
			return this.storeRestaurant(restaurant);
		});
	}
	
	/**
	 * retrieve reviews from db
	 * @param  {Number} id id of review to retrieve
	 * @return {Promise}    promise that will resolve to review json from db
	 */
	static getReview(id = 0){
		return restaurantDb.then(db => {
			const tx = db.transaction('review');
			const reviewStore = tx.objectStore('review');
			let response;
			if(id != 0)
				response = reviewStore.get(Number(id));
			else
				response = reviewStore.getAll();
			return response;
		}).catch(error => {
			console.error(error);
		});
	}

	/**
	 * retrieve reviews for restaurant
	 * @param  {[type]} restaurantId id of restaurant to retrieve reviews for
	 * @return {Promise}    promise that will resolve to restaurant review json from db
	 */
	static getRestaurantReviews(restaurantId){
		return restaurantDb.then(db => {
			const tx = db.transaction('review');
			const reviewStore = tx.objectStore('review');
			const restaurantReviews = reviewStore.index('restaurant');

			return restaurantReviews.getAll(Number(restaurantId));
		}).catch(error => {
			console.error(error);
		});
	}

	/**
	 * retrieve unsynced reviews
	 * Thanks to JaromandaX for helping solve this issue in 
	 * https://stackoverflow.com/questions/52435598/array-from-recursive-promises-returns-undefined
	 * @param  {Number} restaurantId The restaurant to get reviews for
	 * @return {Promise}              promise that will resolve to review json from db
	 */
	static getOperationsToSync(){

		return restaurantDb.then(db => {
			let keyVals = [];

			const tx = db.transaction('unsynced');
			const unsyncedStore = tx.objectStore('unsynced');

			unsyncedStore.iterateCursor(cursor => {
				if(!cursor) return;
				console.log(`key: ${cursor.primaryKey}, val: ${cursor.value}`);
				keyVals.push({key: cursor.primaryKey, value: cursor.value});
				cursor.continue();
			});

			return tx.complete.then(() => keyVals)
		}).catch(error => {
			console.error(error);
		});

	}

	/**
	 * store new or updated review in db
	 * @param  {Json} review Restaurant data in json
	 * @return {Promise}        Resolves if the review is sucessfully updated
	 */
	static storeReview(review){
		return restaurantDb.then(db => {
			const tx = db.transaction('review', 'readwrite');
			const reviewStore = tx.objectStore('review');
			reviewStore.put(review);
			return tx.complete;
		}).catch(error => {
			console.error(error);
		});
	}

	/**
	 * delete restaurant from db
	 * @param  {int} id id of restaurant to delete
	 * @return {Promise}        Resolves if the review is sucessfully updated
	 */
	static deleteReview(id){
		return restaurantDb.then(db => {
			const tx = db.transaction('review', 'readwrite');
			const reviewStore = tx.objectStore('review');
			reviewStore.delete(id);
			return tx.complete
		}).catch(error => {
			console.error(error);
		})
	}

	/**
	 * Store id of unsynced review
	 * @param  {int} id Id of unsynced restaurant
	 * @return {Promise}        Resolves if the review is sucessfully updated
	 */
	static storeOperationToSync(review){
		return restaurantDb.then(db => {
			const tx = db.transaction('unsynced', 'readwrite');
			const unsyncedStore = tx.objectStore('unsynced');
			unsyncedStore.add(review);
			return tx.complete;
		}).catch(error => {
			console.error(error);
		});
	}

	/**
	 * Deletes id with the specified key from unsynced ids
	 * @param  {int} key Key of id to delete
	 * @return {Promise}        Resolves if the review is sucessfully updated
	 */
	static deleteOperationToSync(key){
		return restaurantDb.then(db => {
			const tx = db.transaction('unsynced', 'readwrite');
			const idStore = tx.objectStore('unsynced');
			idStore.delete(key);
			return tx.complete;
		}).catch(error => {
			console.error(error);
		});
	}
} 