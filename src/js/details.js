class Details{
	constructor(){
		let worker = new Worker('/src/js/restaurantWorker.js');
		worker.onmessage = handleWorkerMessage;
		getRestaurant(1, worker);
	}
}

handleWorkerMessage = msg => {
	const data = msg.data;
	console.log(`${data.retrieved}: ${data.msgData}`)
}

getRestaurant = (id, worker) => {
	worker.postMessage({action: 'getRestaurant', id: id});
}