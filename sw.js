/* 備蓄サバイバル・シミュレーター サービスワーカー
   ・インストール(ホーム画面に追加)のために使う
   ・いつも最新版を取りにいき(ネット優先)、つながらないときだけ保存しておいた分を使う
   ・BGM・動画(mp3/mp4/webm)は扱わない(ブラウザにそのまま任せる) */
var CACHE = 'bichiku-v1';
var CORE = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(CORE); }).catch(function(){}));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  var req = e.request, url = new URL(req.url);
  if(req.method !== 'GET' || url.origin !== self.location.origin || req.headers.has('range')) return;
  if(/\.(mp3|mp4|webm|m4a)$/i.test(url.pathname)) return;
  e.respondWith(fetch(req).then(function(res){
    if(res && res.ok && res.type === 'basic'){ var copy = res.clone(); caches.open(CACHE).then(function(c){ c.put(req, copy); }); }
    return res;
  }).catch(function(){
    return caches.match(req, {ignoreSearch:true}).then(function(hit){
      return hit || (req.mode === 'navigate' ? caches.match('./') : Response.error());
    });
  }));
});
