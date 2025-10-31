// hooks/useApi.tsx
import { useEffect, useState } from "react";
// Importa hooks para manejar estado y efectos secundarios en componentes React

/**
 * Hook reutilizable para llamadas fetch con async/await.
 * Devuelve un objeto con data, loading, error y función refresh para recargar.
 */

export default function useApi<T>(
  fetcher: () => Promise<T>, // Función asincrónica que hace la petición y devuelve datos del tipo T
  deps: React.DependencyList = [] // Lista de dependencias para controlar cuándo se ejecuta el efecto
) {
  // Estado para almacenar los datos resultantes de la llamada API
  const [data, setData] = useState<T | null>(null);
  // Estado para controlar si la petición está en proceso de carga
  const [loading, setLoading] = useState<boolean>(true);
  // Estado para guardar errores que podrían surgir en la petición
  const [error, setError] = useState<Error | null>(null);

  // Función asincrónica que ejecuta la llamada API y maneja estados
  const load = async () => {
    setLoading(true); // Marca que la carga empezó
    setError(null); // Limpia cualquier error anterior
    try {
      const result = await fetcher(); // Ejecuta la función fetcher que debe retornar una promesa
      setData(result); // Guarda los datos recibidos en estado
    } catch (err: any) {
      setError(err); // Si hay error, lo guarda en estado
    } finally {
      setLoading(false); // Marca que la carga terminó, haya éxito o error
    }
  };

  // useEffect que ejecuta la función load cada vez que cambian las dependencias
  useEffect(() => {
    load(); // Llama a load para disparar petición
    // La siguiente línea desactiva el warning de dependencias para que solo dependa de deps autoritariamente
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // Retorna el estado de la petición y la función refresh para recargar manualmente
  return { data, loading, error, refresh: load };
}
