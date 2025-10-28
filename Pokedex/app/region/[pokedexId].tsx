// app/region/[pokedexId].tsx
import React from "react";
import { View, 
        Text, 
        ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import useApi from "./../hooks/useApi";
import { getPokedex } from "./../services/pokeApi";
import RegionPokemonsList from "./../components/RegionPokemonsList";
import { THEME } from "../_layout";

/**
 * Página que muestra los pokemons de una pokedex/región.
 * useLocalSearchParams lee el param dinámico [pokedexId].
 */

type Params = {
  pokedexId?: string;
};

export default function RegionPage() {
  const params = useLocalSearchParams<Params>();
  const pokedexId = params.pokedexId;
  const { data, loading, error } = useApi(() => getPokedex(pokedexId || "2"), [pokedexId]);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (error) return <Text style={{ padding: 12 }}>Error al cargar la pokédex.</Text>;

  const entries = data?.pokemon_entries || [];

  return (
    <View style={{ flex: 1, backgroundColor: THEME.background }}>
      <Text style={{ fontWeight: "700", fontSize: 18, margin: 12 }}>
        {data?.name || `Pokedex ${pokedexId}`}
      </Text>
      <RegionPokemonsList entries={entries} fetchPokemonByName={function (name: string): Promise<any> {
        throw new Error("Function not implemented.");
      } } />
    </View>
  );
}
