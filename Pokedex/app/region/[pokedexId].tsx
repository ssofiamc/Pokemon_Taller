// app/region/[pokedexId].tsx
import React from "react";
// Importa la biblioteca React para usar JSX y componentes
import { View, 
        Text, 
        ActivityIndicator } from "react-native";
        // Importa componentes de React Native para layout, texto e indicador de carga
import { useLocalSearchParams } from "expo-router";
// Hook de Expo Router que permite acceder a parámetros locales de la pantalla (por ejemplo, un id dinámico en la ruta)
import useApi from "./../hooks/useApi";
// Hook personalizado para hacer llamadas a APIs y manejar loading/error
import { getPokedex } from "./../services/pokeApi";
// Función que consulta a la API de Pokémon para traer los datos de una pokédex/región
import RegionPokemonsList from "./../components/RegionPokemonsList";
// Componente para mostrar la lista de Pokémon de la región
import { THEME } from "../_layout";
// Importa el tema y colores definidos globalmente para la app

/**
 * Página que muestra los pokemons de una pokedex/región.
 * useLocalSearchParams lee el param dinámico [pokedexId].
 */

// Define el tipo de los parámetros que puede recibir la pantalla
type Params = {
  pokedexId?: string; // parámetro opcional con el ID de la pokédex/región
};

export default function RegionPage() {
  // Obtiene los parámetros dinámicos de la ruta (por ejemplo, /region/5)
  const params = useLocalSearchParams<Params>();
  const pokedexId = params.pokedexId;
  // Usa el hook useApi para traer los datos y monitorear loading/error
  // getPokedex(pokedexId): obtiene la info de la región; si no hay ID, usa "2"
  const { data, loading, error } = useApi(() => getPokedex(pokedexId || "2"), [pokedexId]);

  // Si está cargando, renderiza un spinner (círculo animado de carga)
  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  // Si hay error, lo muestra en pantalla
  if (error) return <Text style={{ padding: 12 }}>Error al cargar la pokédex.</Text>;
  // Extrae la lista de Pokémons de la respuesta (puede estar vacía si la respuesta está vacía)
  const entries = data?.pokemon_entries || [];

  // Renderiza la pantalla principal
  return (
    <View style={{ flex: 1, backgroundColor: THEME.background }}>
      {/* Título o nombre de la pokédex/region */}
      <Text style={{ fontWeight: "700", fontSize: 18, margin: 12 }}>
        {data?.name || `Pokedex ${pokedexId}`}
      </Text>
      {/* Lista de Pokémon. El método fetchPokemonByName no está implementado en este ejemplo */}
      <RegionPokemonsList entries={entries} fetchPokemonByName={function (name: string): Promise<any> {
        throw new Error("Error: Función no implementada.");
      } } />
    </View>
  );
}
