// context/FavoritesContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
// Importa React y hooks para crear contexto, manejar estado y efectos secundarios
import AsyncStorage from "@react-native-async-storage/async-storage";
// Para almacenamiento persistente en dispositivo (clave-valor)
import { getPokemon } from "../services/pokeApi";
// Función para obtener datos completos de un Pokémon desde la API

/**
 * FavoritesContext: lista de favoritos y caché mínimo por Pokémon.
 */

// Define estructura mínima de datos de un Pokémon
type PokemonMin = {
  id: number;
  name: string;
  sprites?: any;  // Información de imágenes
  types?: any[];  // Tipos del Pokémon
};

// Define los tipos y funciones disponibles en el contexto de favoritos
type FavoritesContextType = {
  favorites: string[]; // Lista de nombres de favoritos
  favoritesData: Record<string, PokemonMin>; // Caché con datos mínimos por Pokémon
  toggleFavorite: (nameOrId: string | number) => Promise<void>; // Función para añadir o quitar favorito
  isFavorite: (nameOrId: string | number) => boolean;           // Verifica si es favorito
  loadFavoritesFromStorage: () => Promise<void>;                 // Carga favoritos del almacenamiento persistente
};

const FAVORITES_KEY = "@pokedex_favorites_v1"; // Clave para almacenar lista de favoritos
const CACHE_PREFIX = "@pokedex_pokemon_cache_v1:"; // Prefijo para guardar datos cacheados individuales por Pokémon

// Crea el contexto, inicialmente sin valor (undefined)
const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// Proveedor de contexto que envuelve los componentes hijos para compartir estado de favoritos
export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estado que contiene la lista de nombres de favoritos
  const [favorites, setFavorites] = useState<string[]>([]);
  // Estado que contiene un objeto con datos cacheados por nombre de Pokémon
  const [favoritesData, setFavoritesData] = useState<Record<string, PokemonMin>>({});

  // Al montar el componente, carga los favoritos del almacenamiento persistente
  useEffect(() => {
    loadFavoritesFromStorage();
  }, []);

  // Función que carga favoritos y su caché almacenada en AsyncStorage
  const loadFavoritesFromStorage = async () => {
    try {
      const raw = await AsyncStorage.getItem(FAVORITES_KEY); // Leer la lista de favoritos guardados
      if (raw) {
        const parsed: string[] = JSON.parse(raw);            // Parsear de JSON a array
        setFavorites(parsed);                                 // Actualizar estado de favoritos
        const newData: Record<string, PokemonMin> = {};
        // Carga datos cacheados para cada favorito para acceso rápido
        await Promise.all(
          parsed.map(async (name) => {
            const cached = await AsyncStorage.getItem(CACHE_PREFIX + name);
            if (cached) newData[name] = JSON.parse(cached);  // Agrega los datos cacheados a newData
          })
        );
        setFavoritesData(newData);                           // Actualiza estado de datos cacheados
      }
    } catch (err) {
      console.error("loadFavoritesFromStorage", err);       // Log en caso de error
    }
  };

  // Función que guarda la lista de favoritos actual en AsyncStorage
  const persistFavorites = async (items: string[]) => {
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
    } catch (err) {
      console.error("persistFavorites", err);
    }
  };

  // Función que guarda los datos cacheados para un Pokémon individual
  const cachePokemon = async (name: string, data: PokemonMin) => {
    try {
      await AsyncStorage.setItem(CACHE_PREFIX + name, JSON.stringify(data));
      setFavoritesData((s) => ({ ...s, [name]: data })); // Actualiza estado con nuevos datos cacheados
    } catch (err) {
      console.error("cachePokemon", err);
    }
  };

  // Función para borrar los datos cacheados de un Pokémon al quitarlo de favoritos
  const removeCachedPokemon = async (name: string) => {
    try {
      await AsyncStorage.removeItem(CACHE_PREFIX + name); // Borra del almacenamiento
      setFavoritesData((s) => {
        const copy = { ...s };
        delete copy[name];                                // Remueve entrada del estado
        return copy;
      });
    } catch (err) {
      console.error("removeCachedPokemon", err);
    }
  };

  // Función para añadir o quitar un Pokémon de favoritos
  const toggleFavorite = async (nameOrId: string | number) => {
    const name = String(nameOrId).toLowerCase(); // Forma consistente para el nombre
    const exists = favorites.includes(name);    // Verifica si ya es favorito

    if (exists) {
      // Si existe, quita de favoritos y borra cache local
      const newFav = favorites.filter((n) => n !== name);
      setFavorites(newFav);
      await persistFavorites(newFav);
      await removeCachedPokemon(name);
      return;
    }

    // Si no está, lo añade a la lista y guarda la cache
    const newFav = [...favorites, name];
    setFavorites(newFav);
    await persistFavorites(newFav);

    try {
      const pokemon = await getPokemon(name); // Obtiene info completa de la API
      const min = {
        id: pokemon.id,
        name: pokemon.name,
        sprites: pokemon.sprites,
        types: pokemon.types,
      };
      await cachePokemon(name, min);           // Almacena la info cache
    } catch (err) {
      console.warn("No se pudo cachear la ficha al marcar favorito:", err);
    }
  };

  // Devuelve true si un nombre o ID está en la lista de favoritos
  const isFavorite = (nameOrId: string | number) =>
    favorites.includes(String(nameOrId).toLowerCase());

  // Renderiza el proveedor con toda la información y funciones que serán accesibles para consumidores
  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoritesData,
        toggleFavorite,
        isFavorite,
        loadFavoritesFromStorage,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

// Hook personalizado para consumir el contexto, válido solo dentro de FavoritesProvider
export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
