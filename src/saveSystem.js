const DB='BlockWorldStudioDB',STORE='places';
function open(){return new Promise((resolve,reject)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:'id'})};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
export class SaveSystem{
  async list(){const db=await open();return new Promise((res,rej)=>{const q=db.transaction(STORE,'readonly').objectStore(STORE).getAll();q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)})}
  async save(world){const db=await open();const data={id:world.meta.id||crypto.randomUUID(),name:world.meta.name,author:world.meta.author,created:world.meta.created||new Date().toISOString(),updated:new Date().toISOString(),data:world.serialize()};world.meta.id=data.id;return new Promise((res,rej)=>{const q=db.transaction(STORE,'readwrite').objectStore(STORE).put(data);q.onsuccess=()=>res(data);q.onerror=()=>rej(q.error)})}
  async load(id){const db=await open();return new Promise((res,rej)=>{const q=db.transaction(STORE,'readonly').objectStore(STORE).get(id);q.onsuccess=()=>res(q.result?.data||null);q.onerror=()=>rej(q.error)})}
  async remove(id){const db=await open();return new Promise((res,rej)=>{const q=db.transaction(STORE,'readwrite').objectStore(STORE).delete(id);q.onsuccess=()=>res(true);q.onerror=()=>rej(q.error)})}
}
export function downloadJSON(world){const blob=new Blob([JSON.stringify(world.serialize(),null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=(world.meta.name||'place')+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
