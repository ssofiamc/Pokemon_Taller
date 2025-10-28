// app/pokemon/[name].tsx
import React, { useEffect, useState } from "react";
import { View, 
        Text, 
        Image, 
        ScrollView, 
        TouchableOpacity, 
        ActivityIndicator, 
        StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import useApi from "./../hooks/useApi";
import { getPokemon, getPokemonSpecies, getEvolutionChainById } from "./../services/pokeApi";
import { useFavorites } from "./../context/FavoritesContext";

type Params = {
  name?: string;
};

export default function PokemonDetail() {
  const params = useLocalSearchParams<Params>();
  const nameParam = params.name;
  const router = useRouter();
  const [evolutions, setEvolutions] = useState<string[]>([]);
  const { favoritesData, isFavorite, toggleFavorite } = useFavorites();

  const cached = favoritesData?.[String(nameParam).toLowerCase()] || null;
  const { data: pokemon, loading } = useApi(() => getPokemon(nameParam || "1"), [nameParam]);
  const { data: species } = useApi(
    () => (pokemon ? getPokemonSpecies(pokemon.id) : Promise.reject("no pokemon")),
    [pokemon?.id]
  );

  useEffect(() => {
    async function loadEvo() {
      try {
        if (species && species.evolution_chain?.url) {
          const urlParts = species.evolution_chain.url.split("/");
          const id = urlParts[urlParts.length - 2];
          const chain = await getEvolutionChainById(id);
          const names: string[] = [];
          function walk(node: any) {
            if (!node) return;
            if (node.species) names.push(node.species.name);
            if (node.evolves_to && node.evolves_to.length) {
              node.evolves_to.forEach((n: any) => walk(n));
            }
          }
          walk(chain.chain);
          setEvolutions(names);
        }
      } catch (err) {
        console.warn("Error cargando evolution chain", err);
      }
    }
    loadEvo();
  }, [species]);

  const show = pokemon || cached;

  if (!show && loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (!show) return <Text style={{ padding: 12 }}>No se encontró el Pokémon.</Text>;

  const artwork =
    show.sprites?.other?.["official-artwork"]?.front_default || show.sprites?.front_default;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Image source={{ uri: artwork }} style={styles.image} resizeMode="contain" />

        <Text style={styles.name}>
          {show.name.charAt(0).toUpperCase() + show.name.slice(1)} <Text style={styles.id}>#{show.id}</Text>
        </Text>

        <TouchableOpacity
          onPress={() => toggleFavorite(show.name)}
          style={[
            styles.favoriteBtn,
            { backgroundColor: isFavorite(show.name) ? "#F42A28" : "#3e7d17ff" },
          ]}
        >
          <Text style={styles.favoriteBtnText}>
            {isFavorite(show.name) ? "★ Favorito" : "☆ Agregar a favoritos"}
          </Text>
        </TouchableOpacity>

        {/* Tipos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipos</Text>
          <View style={styles.typesRow}>
            {show.types?.map((t: any) => (
              <View key={t.type.name} style={styles.typeTag}>
                <Text style={styles.typeText}>{t.type.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Descripción */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.paragraph}>
            {species?.flavor_text_entries?.find((e: any) => e.language.name === "en")?.flavor_text.replace(/\s+/g, " ") ||
              "No hay descripción disponible."}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estadísticas</Text>
          {show.stats?.map((s: any) => (
            <View key={s.stat.name} style={styles.statRow}>
              <Text style={styles.statName}>{s.stat.name}</Text>
              <Text style={styles.statValue}>{s.base_stat}</Text>
            </View>
          ))}
        </View>

        {/* Movimientos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Movimientos (primeros 6)</Text>
          {show.moves?.slice(0, 6).map((m: any) => (
            <Text key={m.move.name} style={styles.move}>
              • {m.move.name}
            </Text>
          ))}
        </View>

        {/* Evoluciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Evoluciones</Text>
          <View style={styles.evoRow}>
            {evolutions.length === 0 ? (
              <Text style={styles.paragraph}>No se han encontrado evoluciones.</Text>
            ) : (
              evolutions.map((n) => (
                <TouchableOpacity
                  key={n}
                  onPress={() => router.push(`/pokemon/${n}`)}
                  style={styles.evoTag}
                >
                  <Text style={styles.evoText}>{n}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#dfffcaff",
  },
  card: {
    backgroundColor: "#ffffffff",
    margin: 16,
    borderRadius: 24,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 12,
  },
  name: {
    fontSize: 26,
    fontWeight: "800",
    color: "#000000ff",
  },
  id: {
    fontSize: 18,
    color: "#777777ff",
  },
  favoriteBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  favoriteBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  section: {
    width: "100%",
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000ff",
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    color: "#4c4c4cff",
    lineHeight: 20,
  },
  typesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  typeTag: {
    backgroundColor: "#4dad11ff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 50,
    marginRight: 8,
    marginBottom: 8,
  },
  typeText: {
    color: "#FFFFFF",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#dfffcaff",
    padding: 8,
    borderRadius: 10,
    marginVertical: 4,
  },
  statName: {
    color: "#363635ff", 
    fontWeight: "600",
    textTransform: "capitalize",
  },
  statValue: {
    color: "#545852ff",
    fontWeight: "700",
  },
  move: {
    fontSize: 14,
    color: "#555",
    marginVertical: 2,
  },
  evoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  evoTag: {
    backgroundColor: "#4dad11ff",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 6,
  },
  evoText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
