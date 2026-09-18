// This checked-in file intentionally contains no temporary public URL.
// start_edulink.ps1 writes the current URL to runtime-config.override.js.
// Do not place the model relay key here.
(() => {
  const host = window.location.hostname;
  const local = ["localhost", "127.0.0.1"].includes(host)
    || /^(10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[0-1])\.)/.test(host);
  if (local) return;
})();
