// hooks/useNetworkStatus.tsx
import { useEffect, useState } from "react";
// Importa los hooks useEffect para efectos secundarios y useState para manejo de estado
import NetInfo from "@react-native-community/netinfo";
// Importa la librería NetInfo para obtener información del estado de la red

/**
 * Hook que devuelve el estado de la red: isConnected, isInternetReachable, type
 */

export default function useNetworkStatus() {
  // Crea un estado llamado status que contiene información sobre la conexión de red
  // Se inicializa con valores nulos para indicar que aún no se ha detectado el estado
  const [status, setStatus] = useState<{
    isConnected: boolean | null;         // Indica si el dispositivo está conectado a cualquier red
    isInternetReachable: boolean | null; // Indica si hay conexión a internet real (más allá de la red local)
    type?: string | null;                 // Tipo de conexión: wifi, celular, etc.
  }>({
    isConnected: null,
    isInternetReachable: null,
    type: null,
  });

  // useEffect que se ejecuta una vez al montar el componente
  useEffect(() => {
    // Se suscribe a los cambios del estado de la red
    const unsubscribe = NetInfo.addEventListener((state) => {
      // Actualiza el estado con la nueva información de red cada vez que cambia
      setStatus({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      });
    });

    // Obtiene el estado actual una vez al montar para tener datos inmediatos
    NetInfo.fetch().then((s) =>
      setStatus({
        isConnected: s.isConnected,
        isInternetReachable: s.isInternetReachable,
        type: s.type,
      })
    );

    // Retorna la función para cancelar la suscripción cuando el componente se desmonta
    return () => unsubscribe();
  }, []); // El array vacío indica que éste efecto solo se ejecuta al montar y desmontar

  // Retorna el estado actual de la red para que otros componentes lo puedan usar
  return status;
}
