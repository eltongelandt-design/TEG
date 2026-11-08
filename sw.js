// Offline support: app files cached on install; fonts cached the first time they load.
const CACHE='teg-v5';
const FILES=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin===location.origin){
    // network first so updates arrive, cache when offline
    e.respondWith(fetch(req,{cache:'no-cache'}).then(r=>{const c=r.clone();caches.open(CACHE).then(ca=>ca.put(req,c));return r}).catch(()=>caches.match(req,{ignoreSearch:true}).then(r=>r||caches.match('index.html'))));
  } else if(/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)){
    e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{const c=r.clone();caches.open(CACHE).then(ca=>ca.put(req,c));return r})));
  }
});
