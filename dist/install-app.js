// A waiting worker becomes active after old app windows close; never reload a game.
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register(new URL('./sw.js', import.meta.url), {updateViaCache: 'none'})
    .catch(() => { /* Online use remains available if offline storage is denied. */ });
}
