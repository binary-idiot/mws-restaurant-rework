document.addEventListener("DOMContentLoaded",e=>{let t=new Worker("/src/js/restaurantWorker.js");t.onmessage=handleWorkerMessage,getRestaurant(t,1)}),handleWorkerMessage=(e=>{const t=e.data,a=t.msgData;switch(t.retrieved){case"restaurant":console.log(a)}}),getRestaurant=((e,t)=>{e.postMessage({action:"getRestaurant",id:t})});
//# sourceMappingURL=../maps/details.js.map
