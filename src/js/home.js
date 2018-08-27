class Home{

	constructor(){
		let worker = new Worker('/src/js/restaurantWorker.js');
		worker.onmessage = handleWorkerMessage;
		getRestaurants(worker)
	}
}

handleWorkerMessage = msg => {
	const data = msg.data;
	for(restaurant of data.msgData){
		console.log(restaurant);
	}
}

getRestaurants = worker => {
	worker.postMessage({action: 'getRestaurants', filter: {cuisine: 'Asian', neighborhood: 'Manhattan'}});
}