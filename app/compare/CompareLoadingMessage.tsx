"use client";

import { useEffect, useState } from "react";

const loadingMessages = [
  "Searching Deez Watchez... got 'em.",
  "Hold up... Deez Watchez are loading.",
  "You looking for Deez Watchez? 👀",
  "Loading Deez Watchez... nice.",
  "Finding the finest Deez Watchez money can buy.",
  "Deez Watchez aren't gonna compare themselves.",
  "Searching high and low for Deez Watchez.",
  "Preparing Deez Watchez for your wrist.",
  "Just a sec... polishing Deez Watchez. ✨",
  "You know what time it is? Deez Watchez time.",
  "Waitin' on Deez Watchez like... got 'em.",
  "What watchez? Deez Watchez.",
  "Please hold while we handle Deez Watchez.",
  "Our servers are currently inspecting Deez Watchez. 🔍",
  "Big wrist energy loading... courtesy of Deez Watchez.",
  "Deez Watchez are almost ready. Try not to blow your whole paycheck.",
  "Relax. Deez Watchez are worth the wait.",
  "Searching thousands of watches so Deez Watchez hit different.",
  "One does not simply rush Deez Watchez.",
];

export function CompareLoadingMessage() {
  const [message, setMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    const storageKey = "deezwatchez-loading-message-index";
    const currentIndex = Number(window.sessionStorage.getItem(storageKey) ?? "-1");
    const nextIndex = Number.isFinite(currentIndex)
      ? (currentIndex + 1) % loadingMessages.length
      : 0;

    window.sessionStorage.setItem(storageKey, String(nextIndex));
    setMessage(loadingMessages[nextIndex]);
  }, []);

  return <>{message}</>;
}
