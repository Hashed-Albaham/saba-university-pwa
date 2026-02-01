const CACHE_NAME = 'saba-university-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './icons/icon-192x192.png',
    './icons/icon-512x512.png'
];

// 1. تثبيت Service Worker وتخزين الملفات
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching app shell...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    // تنشيط فوري بدون انتظار
    self.skipWaiting();
});

// 2. تنشيط وحذف الكاش القديم
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // التحكم الفوري بجميع الصفحات
    self.clients.claim();
});

// 3. جلب الملفات (Network First with Cache Fallback)
self.addEventListener('fetch', (event) => {
    // تجاهل الطلبات غير HTTP/HTTPS
    if (!event.request.url.startsWith('http')) return;

    // تجاهل طلبات chrome-extension
    if (event.request.url.includes('chrome-extension')) return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // إذا نجح الطلب، خزنه في الكاش
                if (response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // إذا فشل الإنترنت، جلب من الكاش
                return caches.match(event.request).then((response) => {
                    if (response) {
                        return response;
                    }
                    // إذا لم يوجد في الكاش، حاول جلب الصفحة الرئيسية
                    if (event.request.mode === 'navigate') {
                        return caches.match('./index.html');
                    }
                });
            })
    );
});

// 4. استقبال رسائل من الصفحة
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
