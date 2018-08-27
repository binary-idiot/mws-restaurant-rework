class Home{

	constructor(){
		// worker to handle all restaurant retrieval
		let worker = new Worker('/src/js/restaurantWorker.js');
		worker.onmessage = handleWorkerMessage;
		getRestaurants(worker, {cuisine: 'Asian', neighborhood: 'Manhattan'});
	}
}

/**
 * Handle messages from worker thread
 * @param  {Message} msg Message from worker
 */
handleWorkerMessage = msg => {
	const data = msg.data;
	const content = data.msgData;

	switch(data.retrieved){
		case 'restaurants':
			for(restaurant of content)
				console.log(restaurant);
		break;
	}
}

/**
 * Have the worker retrieve restaurants based on filter criteria
 * @param {RestaurantWorker} worker worker to handle request
 * @param {Json} filter criteria to filter restaurants by
 */
getRestaurants = (worker, filter) => {
	worker.postMessage({action: 'getRestaurants', filter: filter});
}