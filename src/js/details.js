let restaurant,
	worker;

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
			console.log(content);
			break;
	}
}

getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
  	console.error(`Error no ${name} in url`);
    return null;
  if (!results[2])
    return '';
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