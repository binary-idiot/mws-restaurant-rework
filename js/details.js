let restaurant,worker;document.addEventListener("DOMContentLoaded",e=>{this.worker=new Worker("/src/js/restaurantWorker.js"),this.worker.onmessage=handleWorkerMessage,getRestaurant(getParameterByName("id"))}),handleWorkerMessage=(e=>{const r=e.data,t=r.msgData;switch(r.retrieved){case"restaurant":console.log(t)}}),getParameterByName=((e,r)=>{r||(r=window.location.href),e=e.replace(/[\[\]]/g,"\\$&");const t=new RegExp(`[?&]${e}(=([^&#]*)|&|#|$)`).exec(r);return t||console.error(`Error no ${e} in url`),null}),getRestaurant=((e,r=self.worker)=>{r.postMessage({action:"getRestaurant",id:e})});
//# sourceMappingURL=../maps/details.js.map
