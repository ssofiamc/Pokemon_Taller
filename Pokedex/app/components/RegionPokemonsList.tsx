// components/RegionPokemonsList.tsx
import React from "react";
// Importa React para definir componentes funcionales
import { VirtualizedList } from "react-native";
// Importa VirtualizedList, un componente optimizado para listas largas o muy grandes
import PokemonCard from "./PokemonCard";
// Importa un componente personalizado para mostrar cada tarjeta de Pokémon
import { PokedexEntry } from "../services/pokeApi";
// Importa el tipo de dato para cada entrada de pokédex

/**
 * Ejemplo de uso de VirtualizedList para listas largas (pokemons por región).
 * Recibe entries: PokedexEntry[] (cada item tiene pokemon_species.name)
 *
 * VirtualizedList mejora rendimiento en listas muy largas al renderizar solo
 * lo visible y un poco más para optimizar memoria y velocidad.
 */

// Define las props que recibirá el componente
type Props = {
  entries: PokedexEntry[]; // Lista de entradas pokédex para renderizar
  fetchPokemonByName: (name: string) => Promise<any>; // Función para obtener ficha Pokémon (no usada aquí)
};

// Componente funcional para mostrar la lista de Pokémon de una región
export default function RegionPokemonsList({ entries, fetchPokemonByName }: Props) {
  // Función para obtener el item en "index" a partir de los datos
  const getItem = (_data: any, index: number) => entries[index];
  // Función que devuelve la cantidad de items en el arreglo
  const getItemCount = () => entries.length;

  return (
    // Renderiza la lista optimizada VirtualizedList
    <VirtualizedList
      data={entries} // Datos de lista a mostrar
      initialNumToRender={10} // Renderiza solo 10 items inicialmente para mejorar rendimiento
      getItem={getItem} // Función para obtener item por índice requerido por VirtualizedList
      getItemCount={getItemCount} // Función para obtener total de items requerido por VirtualizedList
      keyExtractor={(item: PokedexEntry) => item.pokemon_species.name} 
      // Función para identificar cada elemento con clave única (nombre del Pokémon)
      renderItem={({ item }) => {
        const name = item.pokemon_species.name; // Extrae el nombre de la especie Pokémon
        return (
          // Renderiza una tarjeta Pokémon con los datos básicos
          <PokemonCard
            id={item.entry_number} 
            name={name}
            sprites={undefined} // No se pasan sprites, quedaría para futura implementación
            types={undefined} // Tampoco se pasan tipos por ahora
          />
        );
      }}
    />
  );
}
