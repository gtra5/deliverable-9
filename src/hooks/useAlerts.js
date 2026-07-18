import { useCallback, useState } from "react";

export function useAlerts() {
  const [alerts, setAlerts] = useState([]);

  const add = useCallback((a) => {
    setAlerts((prev) => [
      ...prev,
      { ...a, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, triggered: false },
    ]);
  }, []);

  const remove = useCallback((id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const markTriggered = useCallback((id) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, triggered: true } : a)));
  }, []);

  return { alerts, add, remove, markTriggered };
}

export function crosses(direction, threshold, price) {
  return direction === "above" ? price >= threshold : price <= threshold;
}
