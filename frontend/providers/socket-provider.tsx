"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";

interface SocketContextValue {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  connected: false,
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const targetUrl = process.env.NEXT_PUBLIC_WS_URL || "";
    const instance = io(targetUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    instance.on("connect", onConnect);
    instance.on("disconnect", onDisconnect);
    setSocket(instance);

    return () => {
      instance.off("connect", onConnect);
      instance.off("disconnect", onDisconnect);
      instance.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, []);

  const value = useMemo(
    () => ({ socket, connected }),
    [socket, connected]
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
