class Helper {

	/**
	 * get url for the specified restaurant
	 * @param  {Json} restaurant restaurant to get url for
	 * @return {String}            The url of the restaurant as a string
	 */
	static urlForRestaurant(restaurant){
		return (`./restaurant.html?id=${restaurant.id}`);
	}

	/**
	 * get url for the restaurants img
	 * @param  {Json} restaurant   The restaurant to get the img for
	 * @return {String}            The url of the img as a string
	 */
	static imageUrlForRestaurant(restaurant){
		return (`/img/${restaurant.photograph}`);
	}

	/**
	 * Add marker for restaurant to map
	 * @param  {Json} restaurant The restaurant to add to the map
	 * @param  {Map} map        The map to add marker to
	 * @return {Marker}           The marker that was added
	 */
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

  	/**
	 * get value of url param
	 * @param  {String} name param to search for
	 * @param  {String} url  url to search
	 * @return {String}      Value of param
	 */
	static getParameterByName(name, url){
	  if (!url) url = window.location.href;
	    name = name.replace(/[\[\]]/g, '\\$&');
	    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
	        results = regex.exec(url);
	    if (!results) return null;
	    if (!results[2]) return '';
	    return decodeURIComponent(results[2].replace(/\+/g, ' '));
	}

}
