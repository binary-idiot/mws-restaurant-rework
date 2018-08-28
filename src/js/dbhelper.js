importScripts('//rawgit.com/jakearchibald/idb/master/lib/idb.js')

var restaurantDb = idb.open('restaurants-db', 1, db => {
  switch(db.oldVersion){
    case 0:
    const restaurantStore = db.createObjectStore('restaurant', {keyPath: 'id'});
    case 1:
    const reviewStore = db.createObjectStore('review', {keyPath: 'id'});
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

}