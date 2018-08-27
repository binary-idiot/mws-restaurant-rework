class Details{
	constructor(){
		// worker to handle all restaurant retrieval
		let worker = new Worker('/src/js/restaurantWorker.js');
		worker.onmessage = handleWorkerMessage;
		getRestaurant(worker, 1);
	}
}

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

/**
 * Have the worker retrieve a restaurant
 * @param  {RestaurantWorker} worker worker to handle request
 * @param  {Int} id     id of restaurant to retrieve
 */
getRestaurant = (worker, id) => {
	worker.postMessage({action: 'getRestaurant', id: id});
}