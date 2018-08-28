class Helper {
	
	static urlForRestaurant(restaurant){
		return (`./restaurant.html?id=${restaurant.id}`);
	}

	static imageUrlForRestaurant(restaurant){
		return (`/img/${restaurant.photograph}`);
	}
}

