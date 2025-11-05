const KEY = 'favorites'
export function loadFavs(){ try{ return JSON.parse(localStorage.getItem(KEY) || '[]') }catch{ return [] } }
export function saveFavs(arr){ localStorage.setItem(KEY, JSON.stringify(arr)) }
export function toggleFav(id){ const arr = loadFavs(); const idx = arr.indexOf(id); if(idx>=0){ arr.splice(idx,1) } else { arr.push(id) } saveFavs(arr) }
export function isFav(id){ return loadFavs().includes(id) }
