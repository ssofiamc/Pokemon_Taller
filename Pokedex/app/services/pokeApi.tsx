// services/pokeApi.tsx
/**
 * Servicio para consumir PokeAPI.
 * Tipos simples y manejo de errores.
 */

const BASE = "https://pokeapi.co/api/v2";

export type PokedexEntry = {
  entry_number: number;
  pokemon_species: { name: string; url: string };
};

export async function getRegions() {
  const res = await fetch(`${BASE}/region`);
  if (!res.ok) throw new Error("Error fetching regions");
  const data = await res.json();
  return data.results as { name: string; url: string }[];
}

export async function getPokedex(pokedexId: string | number) {
  const res = await fetch(`${BASE}/pokedex/${pokedexId}`);
  if (!res.ok) throw new Error("Error fetching pokedex");
  const data = await res.json();
  return data;
}

export async function getPokemon(nameOrId: string | number) {
  const res = await fetch(`${BASE}/pokemon/${nameOrId}`);
  if (!res.ok) throw new Error("Pokemon not found");
  const data = await res.json();
  return data;
}

export async function getPokemonSpecies(nameOrId: string | number) {
  const res = await fetch(`${BASE}/pokemon-species/${nameOrId}`);
  if (!res.ok) throw new Error("Species not found");
  const data = await res.json();
  return data;
}

export async function getTypes() {
  const res = await fetch(`${BASE}/type`);
  if (!res.ok) throw new Error("Error fetching types");
  const data = await res.json();
  return data.results;
}

export async function getEvolutionChainById(id: string | number) {
  const res = await fetch(`${BASE}/evolution-chain/${id}`);
  if (!res.ok) throw new Error("Error fetching evolution chain");
  const data = await res.json();
  return data;
}
