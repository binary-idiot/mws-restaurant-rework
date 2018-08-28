class APIHelper{static get API_URL(){return"http://localhost:1337"}static getRestaurant(e=""){return fetch(`${APIHelper.API_URL}/restaurants/${e}`).then(e=>{if(!e.ok)throw new Error(`Request failed. Returned status of ${e.status}`);return e.json()}).catch(e=>{console.error(e)})}static getFavorites(){return getRestaurant("?is_favorite=true")}static getReview(e="",t=!1){const r=t?"?restaurant_id=":"";return fetch(`${APIHelper.API_URL}/reviews/${r}${e}`).then(e=>{if(!e.ok)throw new Error(`Request failed. Returned status of ${e.status}`);return e.json()}).catch(e=>{console.error(e)})}static postReview(e){return fetch(`${APIHelper.API_URL}/reviews/`,{method:"post",body:JSON.stringify(e)}).then(e=>{if(!e.ok)throw new Error(`Request failed. Returned status of ${e.status}`)}).catch(e=>{console.error(e)})}static updateFavorite(e,t){return fetch(`${APIHelper.API_URL}/restaurants/${e}/?is_favorite=${t}`).then(e=>{if(!e.ok)throw new Error(`Request failed. Returned status of ${e.status}`)}).catch(e=>{console.error(e)})}static updateReview(e,t){return fetch(`${APIHelper.API_URL}/reviews/${e}`,{method:"put",body:JSON.stringify(t)}).then(e=>{if(!e.ok)throw new Error(`Request failed. Returned status of ${e.status}`)}).catch(e=>{console.error(e(e))})}static deleteReview(e){return fetch(`${APIHelper.API_URL}/reviews/${e}`,{method:"delete"}).then(e=>{if(!e.ok)throw new Error(`Request failed. Returned status of ${e.status}`)}).catch(e=>{console.error(e)})}}
//# sourceMappingURL=../maps/apihelper.js.map