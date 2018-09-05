const staticCache = 'restaurant-reviews-static-';
const staticVer = 'v2';

self.addEventListener('install', event =>{
	event.waitUntil(

		// Precache main application files
		caches.open(`${staticCache}${staticVer}`).then(cache => {
			return cache.addAll(['/', '/restaurant.html', '/review.html',
				'js/home.js', 'js/details.js', 'js/review.js', 'js/restaurantWorker.js',
				'js/dbhelper.js', 'js/apihelper.js', 'js/helper.js', 'js/swhelper.js',
				'css/styles.css',
				'https://rawgit.com/jakearchibald/idb/master/lib/idb.js',
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

self.addEventListener('fetch', event => {
	if(!event.request.url.startsWith('http://localhost:1337/'))
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
});