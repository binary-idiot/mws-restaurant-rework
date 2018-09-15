let restaurant,worker,id,reviews,reviewID;var newMap;document.addEventListener("DOMContentLoaded",e=>{SWHelper.registerServiceWorker(),this.reviews=[],this.worker=new Worker("/js/restaurantWorker.js"),this.worker.onmessage=handleWorkerMessage,this.id=Number(Helper.getParameterByName("id")),this.reviewID=Number(Helper.getParameterByName("review")),requestAnimationFrame(initReviews),getRestaurant(this.id),getReviews(this.id),requestAnimationFrame(fillFormTitle)}),handleWorkerMessage=(e=>{const t=e.data,n=t.msgData;switch(t.retrieved){case"restaurant":self.restaurant=n,requestAnimationFrame(initMap),requestAnimationFrame(fillRestaurantHTML);break;case"restaurantReviews":addReviews(n),requestAnimationFrame(resetReviews);break;case"uploadReview":n?(requestAnimationFrame(notifyUploadSuccess),self.reviews=[],getReviews(self.id)):(requestAnimationFrame(notifyUploadFail),registerSync());break;case"delete":n?requestAnimationFrame(notifyDeleteSuccess):(requestAnimationFrame(notifyDeleteFail),registerSync()),self.reviews=[],getReviews(self.id)}}),initMap=(()=>{const e=self.restaurant;self.newMap=L.map("map",{center:[e.latlng.lat,e.latlng.lng],zoom:16,scrollWheelZoom:!1}),L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}",{mapboxToken:"pk.eyJ1IjoiYmluYXJ5aWRpb3QiLCJhIjoiY2pqMzZjNWRtMWF2YTNrbXRsb2VueGlydyJ9.mkjp31-552zW210Dz1PUcQ",maxZoom:18,attribution:'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',id:"mapbox.streets"}).addTo(newMap),Helper.mapMarkerForRestaurant(self.restaurant,self.newMap)}),initReviews=(()=>{const e=document.getElementById("reviews-container"),t=document.createElement("h3");t.innerHTML="Reviews",e.insertBefore(t,e.firstChild)}),getRestaurant=((e,t=self.worker)=>{t.postMessage({action:"getRestaurant",id:e})}),getReviews=((e,t=self.worker)=>{t.postMessage({action:"getRestaurantReviews",id:e})}),createReview=((e,t=self.worker)=>{t.postMessage({action:"createReview",review:e})}),updateReview=((e,t,n=self.worker)=>{n.postMessage({action:"updateReview",id:e,review:t})}),deleteReview=((e,t=self.worker)=>{t.postMessage({action:"deleteReview",id:e})}),getReview=((e=self.reviewID)=>{for(review of self.reviews)if(review.id==Number(e))return review;return null}),addReviews=(e=>{for(newReview of e){let e=!1;for([index,review]of self.reviews.entries())if(review.id==newReview.id){e=!0,self.reviews[index]=newReview;break}e||self.reviews.push(newReview)}}),registerSync=(()=>{navigator.serviceWorker.ready.then(e=>e.sync.register("syncReviews")).catch(e=>{console.error(e)})}),fillFormTitle=(()=>{const e=document.getElementById("form-title"),t=self.reviewID?"Update":"Create";e.innerHTML=`${t} review`}),fillRestaurantHTML=(()=>{const e=self.restaurant;document.getElementById("restaurant-name").innerHTML=e.name,document.getElementById("restaurant-address").innerHTML=e.address;const t=document.getElementById("restaurant-img"),n=Helper.imageUrlForRestaurant(e);t.className="restaurant-img",t.src=`${n}-small.jpg`,t.srcset=`${n}-small.jpg 300w, ${n}-medium.jpg 600w, ${n}-large.jpg 800w`,t.size="(max-width: 767) calc(100% - 30px), calc(50% - 30px)",t.alt=e.alt,document.getElementById("restaurant-cuisine").innerHTML=e.cuisine_type,e.operating_hours&&fillRestaurantHoursHTML(),fillBreadcrumb()}),fillRestaurantHoursHTML=((e=self.restaurant.operating_hours)=>{const t=document.getElementById("restaurant-hours");for(let n in e){const i=document.createElement("tr"),r=document.createElement("td");r.innerHTML=n,i.appendChild(r);const a=document.createElement("td"),s=e[n].replace(/,/,"<br>");a.innerHTML=s,i.appendChild(a),t.appendChild(i)}}),fillBreadcrumb=(()=>{const e=self.restaurant,t=document.getElementById("breadcrumb"),n=document.createElement("li");n.innerHTML=e.name,t.appendChild(n)}),fillReviewHTML=(()=>{const e=self.reviews,t=document.getElementById("reviews-container");if(0==e.length){const e=document.createElement("p");return e.innerHTML="No reviews yet!",void t.insertBefore(e,t.firstChild.nextSibling)}const n=document.getElementById("reviews-list");for(review of e)n.appendChild(createReviewHTML(review));t.insertBefore(n,t.firstChild.nextSibling)}),fillReviewForm=(()=>{const e=getReview();if(e){document.getElementById("review-name").value=e.name,document.getElementById("review-rating").value=e.rating,document.getElementById("review-comments").value=e.comments}}),clearReviewForm=(()=>{document.getElementById("review-name").value="",document.getElementById("review-rating").value=1,document.getElementById("review-comments").value=""}),resetReviews=(()=>{const e=document.getElementById("no-reviews");e&&e.remove(),document.getElementById("reviews-list").innerHTML="",fillReviewHTML(),self.reviewID&&fillReviewForm()}),createReviewHTML=(e=>{const t=document.createElement("li"),n=document.createElement("div");n.classList.add("review-header");const i=document.createElement("p");i.innerHTML=e.name,i.classList.add("review-name"),n.appendChild(i);const r=document.createElement("p"),a=new Date(e.updatedAt).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"});r.innerHTML=a,r.classList.add("review-date"),n.appendChild(r);const s=document.createElement("div");s.classList.add("review-content");const d=document.createElement("p");d.innerHTML=`Rating: ${e.rating}`,d.classList.add("review-rating"),s.appendChild(d);const l=document.createElement("a");l.innerHTML="Edit",l.classList.add("review-edit"),l.href=`${Helper.urlForRestaurant(self.restaurant)}&review=${e.id}#review-form`,s.appendChild(l);const o=document.createElement("a");o.innerHTML="Delete",o.classList.add("review-delete"),o.addEventListener("click",t=>{confirmDelete(e.id)}),s.appendChild(o);const m=document.createElement("p");return m.innerHTML=e.comments,m.classList.add("review-comments"),s.appendChild(m),t.appendChild(n),t.appendChild(s),t}),handleFormSubmit=(()=>{const e=document.getElementById("review-name").value,t=document.getElementById("review-rating"),n=t[t.selectedIndex].value,i=document.getElementById("review-comments").value;self.reviewID?updateReview(self.reviewID,{name:e,rating:n,comments:i}):createReview({restaurant_id:self.id,name:e,rating:n,comments:i}),clearReviewForm()}),confirmDelete=(e=>{const t=document.getElementById("delete-dialog"),n=t.getElementsByTagName("button");for(let t of n)t.addEventListener("click",t=>{"delete"===t.target.value&&deleteReview(e),document.getElementById("delete-dialog").classList.add("hidden"),document.getElementById("dialog-spacer").classList.add("hidden")});t.classList.remove("hidden"),document.getElementById("dialog-spacer").classList.remove("hidden"),document.getElementById("delete-button").focus()}),notifyUploadFail=(()=>{notifyUpdate("Review will be uploaded when reconnected.")}),notifyUploadSuccess=(()=>{notifyUpdate("Review successfully uploaded.")}),notifyDeleteSuccess=(()=>{notifyUpdate("Review successfully deleted")}),notifyDeleteFail=(()=>{notifyUpdate("Review will be deleted when reconnected")}),notifyUpdate=(e=>{const t=document.getElementById("update-dialog");document.getElementById("updateTitle").innerHTML=e;const n=t.getElementsByTagName("button");for(let e of n)e.addEventListener("click",e=>{document.getElementById("update-dialog").classList.add("hidden"),document.getElementById("dialog-spacer").classList.add("hidden")});t.classList.remove("hidden"),document.getElementById("dialog-spacer").classList.remove("hidden"),document.getElementById("dismiss-update-button").focus()});
//# sourceMappingURL=../maps/details.js.map
