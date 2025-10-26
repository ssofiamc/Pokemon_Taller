// context/FavoritesContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getPokemon } from "../services/pokeApi";

/**
 * FavoritesContext: lista de favoritos y cache mínimo por pokemon.
 */

type PokemonMin = {
  id: number;
  name: string;
  sprites?: any;
  types?: any[];
};

type FavoritesContextType = {
  favorites: string[];
  favoritesData: Record<string, PokemonMin>;
  toggleFavorite: (nameOrId: string | number) => Promise<void>;
  isFavorite: (nameOrId: string | number) => boolean;
  loadFavoritesFromStorage: () => Promise<void>;
};

const FAVORITES_KEY = "@pokedex_favorites_v1";
const CACHE_PREFIX = "@pokedex_pokemon_cache_v1:";

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoritesData, setFavoritesData] = useState<Record<string, PokemonMin>>(
    {}
  );

  useEffect(() => {
    loadFavoritesFromStorage();
  }, []);

  const loadFavoritesFromStorage = async () => {
    try {
      const raw = await AsyncStorage.getItem(FAVORITES_KEY);
      if (raw) {
        const parsed: string[] = JSON.parse(raw);
        setFavorites(parsed);
        const newData: Record<string, PokemonMin> = {};
        await Promise.all(
          parsed.map(async (name) => {
            const cached = await AsyncStorage.getItem(CACHE_PREFIX + name);
            if (cached) newData[name] = JSON.parse(cached);
          })
        );
        setFavoritesData(newData);
      }
    } catch (err) {
      console.error("loadFavoritesFromStorage", err);
    }
  };

  const persistFavorites = async (items: string[]) => {
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
    } catch (err) {
      console.error("persistFavorites", err);
    }
  };

  const cachePokemon = async (name: string, data: PokemonMin) => {
    try {
      await AsyncStorage.setItem(CACHE_PREFIX + name, JSON.stringify(data));
      setFavoritesData((s) => ({ ...s, [name]: data }));
    } catch (err) {
      console.error("cachePokemon", err);
    }
  };

  const removeCachedPokemon = async (name: string) => {
    try {
      await AsyncStorage.removeItem(CACHE_PREFIX + name);
      setFavoritesData((s) => {
        const copy = { ...s };
        delete copy[name];
        return copy;
      });
    } catch (err) {
      console.error("removeCachedPokemon", err);
    }
  };

  const toggleFavorite = async (nameOrId: string | number) => {
    const name = String(nameOrId).toLowerCase();
    const exists = favorites.includes(name);
    if (exists) {
      const newFav = favorites.filter((n) => n !== name);
      setFavorites(newFav);
      await persistFavorites(newFav);
      await removeCachedPokemon(name);
      return;
    }

    const newFav = [...favorites, name];
    setFavorites(newFav);
    await persistFavorites(newFav);

    try {
      const pokemon = await getPokemon(name);
      const min = {
        id: pokemon.id,
        name: pokemon.name,
        sprites: pokemon.sprites,
        types: pokemon.types,
      };
      await cachePokemon(name, min);
    } catch (err) {
      console.warn("No se pudo cachear la ficha al marcar favorito:", err);
    }
  };

  const isFavorite = (nameOrId: string | number) =>
    favorites.includes(String(nameOrId).toLowerCase());

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

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
