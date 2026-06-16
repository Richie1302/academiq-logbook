self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || "AcademiQ";
  const options = {
    body: data.body || "Don't forget to write your logbook entry today!",
    icon: "/logo.svg",
    badge: "/favicon.svg",
    tag: data.tag || "academiq-reminder",
    renotify: true,
    data: { url: data.url || "/dashboard" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/dashboard";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
