// components/RegionPokemonsList.tsx
import React from "react";
import { VirtualizedList } from "react-native";
import PokemonCard from "./PokemonCard";
import { PokedexEntry } from "../services/pokeApi";

/**
 * Ejemplo de uso de VirtualizedList para listas largas (pokemons por región).
 * Receives entries: PokedexEntry[] (cada item tiene pokemon_species.name)
 *
 * VirtualizedList claramente mejora rendimiento en listas muy largas.
 */

type Props = {
  entries: PokedexEntry[];
  fetchPokemonByName: (name: string) => Promise<any>; // función para obtener ficha (para cada row)
};

export default function RegionPokemonsList({ entries, fetchPokemonByName }: Props) {
  const getItem = (_data: any, index: number) => entries[index];
  const getItemCount = () => entries.length;

  return (
    <VirtualizedList
      data={entries}
      initialNumToRender={10}
      getItem={getItem}
      getItemCount={getItemCount}
      keyExtractor={(item: PokedexEntry) => item.pokemon_species.name}
      renderItem={({ item }) => {
        const name = item.pokemon_species.name;
        return (
          <PokemonCard
            id={item.entry_number}
            name={name}
            sprites={undefined}
            types={undefined}
          />
        );
      }}
    />
  );
}
