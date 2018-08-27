let page;

document.addEventListener('DOMContentLoaded', (event) => {
	//SWHelper.registerServiceWorker();
	//filters results from api or db
	//pass service worker and use post message to send requests for queueing
	//or pass function to message service worker
	setPage(); //get restaurant(s)
	//init map with data from page
	//call set markers on page
});

setPage = () => {
	const path = window.location.pathname;
	const results = path.match('(\\w+)(?=\\.)');

	if(results === null) {
		page = new Home();
	} else if(results[0] === 'restaurant') {
		page = new Details();
	}
}

