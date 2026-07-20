import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../api/client";

const CurrentUserContext = createContext(null);

const STORAGE_KEY = "learnly:current-user-id";

export function CurrentUserProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? Number(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .listUsers()
      .then((list) => {
        setUsers(list);
        setCurrentUserId((prev) => {
          if (prev && list.some((u) => u.id === prev)) return prev;
          return list[0]?.id ?? null;
        });
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (currentUserId) localStorage.setItem(STORAGE_KEY, String(currentUserId));
  }, [currentUserId]);

  const switchUser = useCallback((id) => setCurrentUserId(id), []);

  const addUser = useCallback(async (payload) => {
    const created = await api.createUser(payload);
    setUsers((prev) => [...prev, created]);
    setCurrentUserId(created.id);
    return created;
  }, []);

  const currentUser = users.find((u) => u.id === currentUserId) || null;

  return (
    <CurrentUserContext.Provider
      value={{ users, currentUser, currentUserId, switchUser, addUser, loading }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) throw new Error("useCurrentUser must be used within CurrentUserProvider");
  return ctx;
}
