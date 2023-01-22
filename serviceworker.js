const assets = [
  "/",
  "/index.html",
  "/styles.css",
  "/script.js",
  "/android-chrome-192x192.png",
  "/android-chrome-384x384.png",
  "/apple-touch-icon.png",
  "/background.svg",
  "/browserconfig.xml",
  "/favicon-16x16.png",
  "/favicon-32x32.png",
  "/favicon.ico",
  "/Grid.js",
  "/mstile-150x150.png",
  "/safari-pinned-tab.svg",
  "/Tile.js"
]

self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(staticDevCoffee).then(cache => {
      cache.addAll(assets)
    })
  )
})

self.addEventListener("fetch", fetchEvent => {
    fetchEvent.respondWith(
      caches.match(fetchEvent.request).then(res => {
        return res || fetch(fetchEvent.request)
      })
    )
  })