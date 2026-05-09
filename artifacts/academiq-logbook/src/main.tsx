document.getElementById("root")!.innerHTML = `<div style="padding:32px;font-family:sans-serif;background:white;min-height:100vh">
  <h1 style="color:green">App is loading...</h1>
  <p>If you see this, HTML is rendering correctly.</p>
</div>`;

import("./bootstrap").catch(err => {
  document.getElementById("root")!.innerHTML = `<div style="padding:32px;font-family:monospace;color:red;background:white;min-height:100vh">
    <h2>Bootstrap Error</h2>
    <pre>${err?.stack || err?.message || String(err)}</pre>
  </div>`;
});
