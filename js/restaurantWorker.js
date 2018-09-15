importScripts("/js/apihelper.js","/js/dbhelper.js"),self.onmessage=(e=>{const t=e.data;switch(t.action){case"getRestaurants":getRestaurants(t.filter);break;case"getRestaurant":getRestaurant(t.id);break;case"getNeighborhoodsAndCuisines":getNeighborhoodsAndCuisines();break;case"getRestaurantReviews":getRestaurantReviews(t.id);break;case"getReview":getReview(t.id);break;case"createReview":createReview(t.review);break;case"updateReview":updateReview(t.id,t.review);break;case"deleteReview":deleteReview(t.id)}}),getRestaurants=(e=>{DBHelper.getRestaurant().then(t=>{if(t){console.log(`${t.length} restaurants found in db`);const s=filterRestaurants(t,e);self.postMessage({retrieved:"restaurants",msgData:s})}APIHelper.getRestaurant().then(s=>{const a=updateRestaurants(t,s);if(a){const t=filterRestaurants(a,e);self.postMessage({retrieved:"restaurants",msgData:t})}})})}),getRestaurant=(e=>{DBHelper.getRestaurant(e).then(t=>{t&&(console.log(`Restaurant ${e} found in db`),self.postMessage({retrieved:"restaurant",msgData:t})),APIHelper.getRestaurant(e).then(e=>{updateRestaurant(t,e)&&self.postMessage({retrieved:"restaurant",msgData:e})})})}),getNeighborhoodsAndCuisines=(()=>{DBHelper.getRestaurant().then(e=>{if(e){const t={neighborhoods:extractNeighborhoods(e),cuisines:extractCuisines(e)};console.log(`Found ${t.neighborhoods.length} neighborhoods and ${t.cuisines.length} cuisines in db.`),self.postMessage({retrieved:"neighborhoodsAndCuisines",msgData:t})}APIHelper.getRestaurant().then(t=>{if(updateRestaurants(e,t)){const e={neighborhoods:extractNeighborhoods(t),cuisines:extractCuisines(t)};console.log(`Found ${e.neighborhoods.length} neighborhoods and ${e.cuisines.length} cuisines from api.`),self.postMessage({retrieved:"neighborhoodsAndCuisines",msgData:e})}})})}),getRestaurantReviews=(e=>{DBHelper.getRestaurantReviews(e).then(t=>{t&&(console.log(`${t.length} reviews for restaurant ${e} found in db`),self.postMessage({retrieved:"restaurantReviews",msgData:t})),APIHelper.getReview(e,!0).then(e=>{const s=updateReviewsDB(t,e);s&&self.postMessage({retrieved:"restaurantReviews",msgData:s})})})}),getReview=(e=>{DBHelper.getReview(e).then(t=>{t&&(console.log(`Review ${e} found in db`),self.postMessage({retrieved:"review",msgData:t})),APIHelper.getReview(e).then(e=>{updateReviewDB(t,e)&&self.postMessage({retrieved:"review",msgData:e})})})}),createReview=(e=>{APIHelper.createReview(e).then(t=>{t?(console.log("Review successfully uploaded"),self.postMessage({retrieved:"uploadReview",msgData:!0})):(console.log("Unable to upload review, storing locally until connection is re-established..."),DBHelper.storeOperationToSync({mode:"create",review:e}),self.postMessage({retrieved:"uploadReview",msgData:!1}))})}),updateReview=((e,t)=>{APIHelper.updateReview(e,t).then(s=>{s?(console.log("Review successfully uploaded"),self.postMessage({retrieved:"uploadReview",msgData:!0})):(console.log("Unable to upload review, storing locally until connection is re-established..."),DBHelper.storeOperationToSync({mode:"update",id:e,review:t}),self.postMessage({retrieved:"uploadReview",msgData:!1}))})}),deleteReview=(e=>{DBHelper.deleteReview(e).then(()=>{console.log("Review deleted from db"),APIHelper.deleteReview(e).then(t=>{t?(console.log("Review successfully deleted from api"),self.postMessage({retrieved:"delete",msgData:!0})):(console.log("Unable to delete review from api, will try again when reconnected"),DBHelper.storeOperationToSync({mode:"delete",id:e}),self.postMessage({retrieved:"delete",msgData:!1}))})})}),filterRestaurants=((e,t)=>{let s=e;return"all"!=t.cuisine&&(s=s.filter(e=>e.cuisine_type==t.cuisine)),"all"!=t.neighborhood&&(s=s.filter(e=>e.neighborhood==t.neighborhood)),console.log(`${s.length} restaurants match filter`),s}),extractNeighborhoods=(e=>{const t=e.map((t,s)=>e[s].neighborhood);return t.filter((e,s)=>t.indexOf(e)==s)}),extractCuisines=(e=>{const t=e.map((t,s)=>e[s].cuisine_type);return t.filter((e,s)=>t.indexOf(e)==s)}),updateRestaurants=((e,t)=>{let s=[];if(t)for(apiRestaurant of t){let t=!1;if(e)for(restaurant of e)if(restaurant.id==apiRestaurant.id&&restaurant.updatedAt>=apiRestaurant.updatedAt){t=!0;break}t||s.push(apiRestaurant)}if(0!=s.length){for(restaurant of(console.log(`${s.length} restaurants are outdated, updating...`),s))DBHelper.storeRestaurant(restaurant);return s}return null}),updateRestaurant=((e,t)=>{if(t){let s=!0;return e&&e.updatedAt>=t.updatedAt&&(s=!1),!!s&&(console.log(`Restaurant ${t.id} outdated, Updating...`),DBHelper.storeRestaurant(t),!0)}}),updateReviewsDB=((e,t)=>{let s=[];if(t)for(apiReview of t){let t=!1;if(e)for(dbReview of e)if(dbReview.id==apiReview.id&&dbReview.updatedAt>=apiReview.updatedAt){t=!0;break}t||s.push(apiReview)}if(0!=s){for(review of(console.log(`${s.length} reviews are outdated, updating...`),s))DBHelper.storeReview(review);return s}return null}),updateReviewDB=((e,t)=>{if(t){let s=!0;return e&&e.updatedAt>=t.updatedAt&&(s=!1),!!s&&(console.log(`Review ${t.id} outdated, Updating...`),DBHelper.storeReview(t),!0)}});
//# sourceMappingURL=../maps/restaurantWorker.js.map
