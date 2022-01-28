const CACHE_NAME = 'dice-cache-v1';
const _urlsToCache = ['/'];

self.addEventListener('install', function (event) {
    event.waitUntil(caches.open(CACHE_NAME)
        .then(function (_cache) {
            console.log('Opened cache');
        }));
});

self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then(function (response) {
            // cache had a hit - return the cached response
            if (response) {
                console.info('Cache hit', response.url)
                return response;
            }
            // not found in cache, go get it
            return fetch(event.request).then(
                function (response) {
                    // check if we received a valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    } 
                    // we need to clone it so we have two streams.
                    const responseClone = response.clone();
                    // cache the cloned response stream
                    caches.open(CACHE_NAME)
                        .then(function (cache) {
                            cache.put(event.request, responseClone);
                        });
                    // return the original response stream 
                    return response;
                }
            );
        })
    );
});
