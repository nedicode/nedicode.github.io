var dataCacheName = 'tempus-v0.0.1';
var cacheName = 'tempus-0.0.1';
var filesToCache = [
	'index.html',
	'assets/fonts/material-design-icons/material-icons.css',
	'assets/fonts/material-design-icons/MaterialIcons-Regular.eot',
	'assets/fonts/material-design-icons/MaterialIcons-Regular.ijmap',
	'assets/fonts/material-design-icons/MaterialIcons-Regular.svg',
	'assets/fonts/material-design-icons/MaterialIcons-Regular.ttf',
	'assets/fonts/material-design-icons/MaterialIcons-Regular.woff',
	'assets/fonts/material-design-icons/MaterialIcons-Regular.woff2',
	'assets/fonts/roboto/Roboto-Bold.eot',
	'assets/fonts/roboto/Roboto-Bold.ttf',
	'assets/fonts/roboto/Roboto-Bold.woff',
	'assets/fonts/roboto/Roboto-Bold.woff2',
	'assets/fonts/roboto/Roboto-Light.eot',
	'assets/fonts/roboto/Roboto-Light.ttf',
	'assets/fonts/roboto/Roboto-Light.woff',
	'assets/fonts/roboto/Roboto-Light.woff2',
	'assets/fonts/roboto/Roboto-Medium.eot',
	'assets/fonts/roboto/Roboto-Medium.ttf',
	'assets/fonts/roboto/Roboto-Medium.woff',
	'assets/fonts/roboto/Roboto-Medium.woff2',
	'assets/fonts/roboto/Roboto-Regular.eot',
	'assets/fonts/roboto/Roboto-Regular.ttf',
	'assets/fonts/roboto/Roboto-Regular.woff',
	'assets/fonts/roboto/Roboto-Regular.woff2',
	'assets/fonts/roboto/Roboto-Thin.eot',
	'assets/fonts/roboto/Roboto-Thin.ttf',
	'assets/fonts/roboto/Roboto-Thin.woff',
	'assets/fonts/roboto/Roboto-Thin.woff2',
	'assets/js/crel.min.js',
	'assets/js/jquery-1.12.0.min.js',
	'assets/js/main.js',
	'assets/js/materialize.min.js',
	'assets/css/main.css',
	'assets/css/materialize.css',
	'assets/css/materialize.min.css',
	'assets/css/normalize.css'
];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName && key !== dataCacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  /*
   * Fixes a corner case in which the app wasn't returning the latest data.
   * You can reproduce the corner case by commenting out the line below and
   * then doing the following steps: 1) load app for first time so that the
   * initial New York City data is shown 2) press the refresh button on the
   * app 3) go offline 4) reload the app. You expect to see the newer NYC
   * data, but you actually see the initial data. This happens because the
   * service worker is not yet activated. The code below essentially lets
   * you activate the service worker faster.
   */
  return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  console.log('[Service Worker] Fetch', e.request.url);
  var dataUrl = 'https://query.yahooapis.com/v1/public/yql';
  if (e.request.url.indexOf(dataUrl) > -1) {
    /*
     * When the request URL contains dataUrl, the app is asking for fresh
     * weather data. In this case, the service worker always goes to the
     * network and then caches the response. This is called the "Cache then
     * network" strategy:
     * https://jakearchibald.com/2014/offline-cookbook/#cache-then-network
     */
    e.respondWith(
      caches.open(dataCacheName).then(function(cache) {
        return fetch(e.request).then(function(response){
          cache.put(e.request.url, response.clone());
          return response;
        });
      })
    );
  } else {
    /*
     * The app is asking for app shell files. In this scenario the app uses the
     * "Cache, falling back to the network" offline strategy:
     * https://jakearchibald.com/2014/offline-cookbook/#cache-falling-back-to-network
     */
    e.respondWith(
      caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
      })
    );
  }
});
