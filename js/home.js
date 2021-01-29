let restaurants,neighborhoods,cuisines,worker;var newMap,markers=[];document.addEventListener("DOMContentLoaded",e=>{SWHelper.registerServiceWorker(),this.worker=new Worker("js/restaurantWorker.js"),this.worker.onmessage=handleWorkerMessage,requestAnimationFrame(initMap),updateRestaurants(),getNeighborhoodsAndCuisines()}),handleWorkerMessage=(e=>{const t=e.data,a=t.msgData;switch(t.retrieved){case"restaurants":addRestaurants(a),requestAnimationFrame(fillRestaurantsHTML);break;case"neighborhoodsAndCuisines":self.neighborhoods=a.neighborhoods,requestAnimationFrame(fillNeighborhoodHTML),self.cuisines=a.cuisines,requestAnimationFrame(fillCuisineHTML);break;case"favorited":a||registerSync(),updateRestaurants()}}),registerSync=(()=>{navigator.serviceWorker.ready.then(e=>e.sync.register("syncReviews")).catch(e=>{console.error(e)})}),initMap=(()=>{self.newMap=L.map("map",{center:[40.722216,-73.987501],zoom:12,scrollWheelZoom:!1}),L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={mapboxToken}",{mapboxToken:"pk.eyJ1IjoiYmluYXJ5aWRpb3QiLCJhIjoiY2traXBrb3doMHNleDJ2b2RkNG92ajVoMCJ9.G13Ie3WgGMKry_OYHfROng",tileSize:512,maxZoom:18,zoomOffset:-1,attribution:'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',id:"mapbox.streets"}).addTo(newMap)}),getRestaurants=((e,t=this.worker)=>{t.postMessage({action:"getRestaurants",filter:e})}),getNeighborhoodsAndCuisines=((e=this.worker)=>{e.postMessage({action:"getNeighborhoodsAndCuisines"})}),toggleFavorite=((e,t=this.worker)=>{let a=!1;0!=e.is_favorite&&"false"!=e.is_favorite||(a=!0),t.postMessage({action:"setFavorite",id:e.id,state:a})}),addRestaurants=(e=>{for(newRestaurant of e){let e=!1;for([index,restaurant]of self.restaurants.entries())if(restaurant.id==newRestaurant.id){e=!0,self.restaurants[index]=newRestaurant;break}e||self.restaurants.push(newRestaurant)}}),updateRestaurants=(()=>{resetRestaurants();const e=document.getElementById("cuisines-select"),t=document.getElementById("neighborhoods-select"),a=e.selectedIndex,s=t.selectedIndex,r=e[a].value,n=t[s].value;getRestaurants({neighborhood:n,cuisine:r})}),fillNeighborhoodHTML=(()=>{const e=document.getElementById("neighborhoods-select");for(neighborhood of self.neighborhoods){const t=document.createElement("option");t.innerHTML=neighborhood,t.value=neighborhood,e.append(t)}}),fillCuisineHTML=(()=>{const e=document.getElementById("cuisines-select");for(cuisine of self.cuisines){const t=document.createElement("option");t.innerHTML=cuisine,t.value=cuisine,e.append(t)}}),fillRestaurantsHTML=(()=>{const e=document.getElementById("restaurants-list");for(restaurant of self.restaurants)e.append(createRestaurantHTML(restaurant));addMarkersToMap()}),resetRestaurants=(()=>{if(self.restaurants=[],document.getElementById("restaurants-list").innerHTML="",self.markers)for(marker of self.markers)marker.remove();self.markers=[]}),createRestaurantHTML=(e=>{const t=document.createElement("li"),a=document.createElement("img"),s=Helper.imageUrlForRestaurant(e);a.className="restaurant-img",a.src=`${s}-small.jpg`,a.srcset=`${s}-small.jpg 300w, ${s}-medium.jpg 600w, ${s}-large.jpg 800w`,a.sizes="(max-width: 424px) 300px, (max-width: 573px) 449px, 300px",a.alt=e.alt,t.append(a);const r=document.createElement("div");r.classList.add("restaurant-container");const n=document.createElement("h2");n.innerHTML=e.name,r.append(n);const o=document.createElement("button");o.innerHTML="★",o.onclick=(t=>{toggleFavorite(e)}),o.classList.add("fav-button"),o.setAttribute("aria-label","Toggle favorite"),console.log(`restaurant ${e.id} is ${e.is_favorite}`),1==e.is_favorite||"true"==e.is_favorite?(o.classList.add("favorited"),t.setAttribute("aria-label","Favorite Restaurant")):(o.classList.remove("favorited"),t.setAttribute("aria-label","Restaurant")),r.append(o);const i=document.createElement("p");i.innerHTML=e.neighborhood,r.append(i);const l=document.createElement("p"),d=e.address.replace(/,/,",<br>");l.innerHTML=d,r.append(l),t.append(r);const c=document.createElement("a");return c.innerHTML="View Details",c.href=Helper.urlForRestaurant(e),t.append(c),t}),addMarkersToMap=(()=>{for(restaurant of self.restaurants){const e=Helper.mapMarkerForRestaurant(restaurant,self.newMap);e.on("click",()=>{window.location.href=e.options.url}),self.markers.push(e)}});
//# sourceMappingURL=../maps/home.js.map
