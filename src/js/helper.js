class Helper {

	static urlForRestaurant(restaurant){
		return (`./restaurant.html?id=${restaurant.id}`);
	}

	static imageUrlForRestaurant(restaurant){
		return (`/img/${restaurant.photograph}`);
	}

	static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
		const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
		  {title: restaurant.name,
		  alt: restaurant.name,
		  url: Helper.urlForRestaurant(restaurant)
		  })
		  marker.addTo(newMap);
		return marker;
  } 
}

