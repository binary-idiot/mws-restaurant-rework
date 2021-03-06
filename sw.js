importScripts('/js/apihelper.js',
	'/js/dbhelper.js');

const staticCache = 'restaurant-reviews-static-';
const staticVer = 'v3';

self.addEventListener('install', event =>{
	event.waitUntil(

		// Precache main application files
		caches.open(`${staticCache}${staticVer}`).then(cache => {
			return cache.addAll(['/', '/restaurant.html',
				'js/home.js', 'js/details.js', 'js/restaurantWorker.js',
				'js/dbhelper.js', 'js/apihelper.js', 'js/helper.js', 'js/swhelper.js',
				'css/styles.css',
				'https://cdn.jsdelivr.net/npm/idb@2.1.3/lib/idb.min.js',
				'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
				'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js']);
		})

	);
});

self.addEventListener('activate', event =>{
	event.waitUntil(

		// Delete old caches
		caches.keys().then(cacheNames =>{
			return Promise.all(
				cacheNames.filter(cacheName =>{
					return cacheName.startsWith(staticCache) &&
						cacheName != `${staticCache}${staticVer}`;
				}).map(cacheName =>{
					console.log(`Deleting ${cacheName}`)
					return caches.delete(cacheName);
				})
			);
		})

	);
});

self.addEventListener('message', event => {

	if(event.data.action === 'skipWaiting'){
		self.skipWaiting();
	}

});

self.addEventListener('sync', event => {
	if(event.tag == 'syncReviews'){
		console.log('Syncing');
		event.waitUntil(

			//TODO: delete using returned keys
			DBHelper.getOperationsToSync().then(operations => {
				console.log(operations);
				if(operations.length != 0)
				for(operation of operations){
					const val = operation.value;
					const key = operation.key;

					switch(val.mode){
						case 'create':
							APIHelper.createReview(val.review).then(success => {
								if(success){
									console.log(`${val.mode} operation successful`);
									DBHelper.deleteOperationToSync(key);
								}else{
									console.log(`${val.mode} operation failed`);
									return Promise.reject();
								}
							})
							break;
						case 'update':
							APIHelper.updateReview(val.id, val.review).then(success => {
								if(success){
									console.log(`${val.mode} operation successful`);
									DBHelper.deleteOperationToSync(key);
								}else{
									console.log(`${val.mode} operation failed`);
									return Promise.reject();
								}
							})
							break;
						case 'delete':
							APIHelper.deleteReview(val.id).then(success => {
								if(success){
									console.log(`${val.mode} operation successful`);
									DBHelper.deleteOperationToSync(key);
								}else{
									console.log(`${val.mode} operation failed`);
									return Promise.reject();
								}
							})
							break;
						case 'favorite':
							APIHelper.updateReview(val.id, val.state).then(success => {
								if(success){
									console.log(`${val.mode} operation successful`);
									DBHelper.deleteOperationToSync(key);
								}else{
									console.log(`${val.mode} operation failed`);
									return Promise.reject();
								}
							})
							break;
					}

				}
				
				return Promise.resolve();

			})

		)
	}
});

self.addEventListener('fetch', event => {
	if(!event.request.url.startsWith('http://localhost:8081/'))
		if(event.request.url.startsWith('http://localhost:8080/restaurant.html')){
			event.respondWith(
				caches.open(`${staticCache}${staticVer}`).then(cache => {
					return cache.match('restaurant.html').then(response => {
						console.log('Serving restaurant.html from cache');
						return response;
					});
				})
			);
		}else{

			event.respondWith(

				// Look for request in cache
				caches.open(`${staticCache}${staticVer}`).then(cache =>{
					return cache.match(event.request).then(response => {

						// Fetch requests not in cache
						if(!response){
							console.log(`${event.request.url} not in cache, fetching...`);
							const fetchRequest = event.request.clone();
							return fetch(fetchRequest).then(fetchResponse =>{
								
								// Cache new responses
								const fr = fetchResponse.clone();
								cache.put(event.request, fr);
								return fetchResponse;
							});

						}else{
							console.log(`${event.request.url} in cache, serving...`);
							return response;
						}

					})
				})
				
			);
		}
});