// hooks/useNetworkStatus.tsx
import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

/**
 * Hook que devuelve el estado de la red: isConnected, isInternetReachable, type
 */

export default function useNetworkStatus() {
  const [status, setStatus] = useState<{
    isConnected: boolean | null;
    isInternetReachable: boolean | null;
    type?: string | null;
  }>({
    isConnected: null,
    isInternetReachable: null,
    type: null,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setStatus({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      });
    });

    NetInfo.fetch().then((s) =>
      setStatus({
        isConnected: s.isConnected,
        isInternetReachable: s.isInternetReachable,
        type: s.type,
      })
    );

    return () => unsubscribe();
  }, []);

  return status;
}
