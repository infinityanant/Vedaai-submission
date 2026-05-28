import { useEffect } from "react";
import { useAssignments } from "@/store/assignments";
import { getSocket } from "@/lib/socket";

/**
 * Connects to the Socket.io backend and reflects connection state
 * in the Zustand store. This hook should be called once at the app-shell level.
 */
export function useAssignmentsWS() {
  const setWsConnected = useAssignments((s) => s.setWsConnected);

  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => setWsConnected(true);
    const onDisconnect = () => setWsConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    // If already connected (singleton re-used), sync state
    if (socket.connected) setWsConnected(true);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [setWsConnected]);
}
