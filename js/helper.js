class Helper{static urlForRestaurant(t){return`./restaurant.html?id=${t.id}`}static imageUrlForRestaurant(t){return`/img/${t.photograph}`}static mapMarkerForRestaurant(t,a){const r=new L.marker([t.latlng.lat,t.latlng.lng],{title:t.name,alt:t.name,url:Helper.urlForRestaurant(t)});return r.addTo(newMap),r}}
//# sourceMappingURL=../maps/helper.js.map
