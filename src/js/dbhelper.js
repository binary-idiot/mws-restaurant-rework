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

	static getRestaurant(id = null) {
		return restaurantDb.then(db => {
			const tx = db.transaction('restaurant');
			const restaurantStore = tx.objectStore('restaurant');
			let response;
			if(id != null)
				response = restaurantStore.get(Number(id));
			else
				response = restaurantStore.getAll();
			return response;
		}).catch(error => {
			console.error(error);
		});
	}

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