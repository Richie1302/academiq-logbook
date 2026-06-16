import { useState, useEffect, useCallback } from "react";

const NOTIF_TIME_KEY = "academiq_notif_time"; // "HH:MM"
const NOTIF_ENABLED_KEY = "notif_daily";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [reminderTime, setReminderTime] = useState(() => localStorage.getItem(NOTIF_TIME_KEY) || "20:00");

  useEffect(() => {
    const supported = "Notification" in window && "serviceWorker" in navigator;
    setIsSupported(supported);
    if (supported) {
      setPermission(Notification.permission);
      setIsRegistered(Notification.permission === "granted" && localStorage.getItem(NOTIF_ENABLED_KEY) !== "false");
    }
  }, []);

  // Register service worker
  useEffect(() => {
    if (!isSupported) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, [isSupported]);

  // Schedule local notification using a timer check
  useEffect(() => {
    if (!isRegistered || permission !== "granted") return;

    const checkAndNotify = () => {
      const now = new Date();
      const [h, m] = reminderTime.split(":").map(Number);
      const lastNotif = localStorage.getItem("academiq_last_notif");
      const todayKey = now.toISOString().split("T")[0];

      if (now.getHours() === h && now.getMinutes() === m && lastNotif !== todayKey) {
        localStorage.setItem("academiq_last_notif", todayKey);
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification("AcademiQ — Daily Reminder", {
              body: "Don't forget to write your logbook entry for today! It only takes 2 minutes.",
              icon: "/logo.svg",
              badge: "/favicon.svg",
              tag: "daily-reminder",
            });
          });
        }
      }
    };

    const interval = setInterval(checkAndNotify, 30000); // check every 30s
    return () => clearInterval(interval);
  }, [isRegistered, permission, reminderTime]);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;
    try {
      await navigator.serviceWorker.register("/sw.js");
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted") {
        setIsRegistered(true);
        localStorage.setItem(NOTIF_ENABLED_KEY, "true");
        // Send a welcome notification immediately
        const reg = await navigator.serviceWorker.ready;
        reg.showNotification("AcademiQ notifications enabled! 🎉", {
          body: "You'll get a daily reminder to write your logbook entry.",
          icon: "/logo.svg",
          tag: "welcome",
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [isSupported]);

  const disableNotifications = useCallback(() => {
    setIsRegistered(false);
    localStorage.setItem(NOTIF_ENABLED_KEY, "false");
  }, []);

  const updateReminderTime = useCallback((time: string) => {
    setReminderTime(time);
    localStorage.setItem(NOTIF_TIME_KEY, time);
  }, []);

  return {
    isSupported,
    permission,
    isRegistered,
    reminderTime,
    requestPermission,
    disableNotifications,
    updateReminderTime,
  };
}
