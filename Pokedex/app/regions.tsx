// app/regions.tsx
import React from "react";
import { View, 
        Text, 
        FlatList, 
        TouchableOpacity, 
        StyleSheet } from "react-native";
import { useRouter } from "expo-router";

/**
 * Lista de regiones con estilo visual refinado.
 * Paleta luminosa y acentos vivos inspirados en la guía de estilo.
 */

const REGION_TO_POKEDEX: { key: string; label: string; id: number }[] = [
  { key: "kanto", label: "Kanto (I)", id: 2 },
  { key: "johto", label: "Johto (II)", id: 3 },
  { key: "hoenn", label: "Hoenn (III)", id: 4 },
  { key: "sinnoh", label: "Sinnoh (IV)", id: 5 },
  { key: "unova", label: "Unova (V)", id: 8 },
  { key: "kalos", label: "Kalos (VI)", id: 11 },
  { key: "alola", label: "Alola (VII)", id: 21 },
  { key: "galar", label: "Galar (VIII)", id: 27 },
  { key: "paldea", label: "Paldea (IX)", id: 32 },
];

export default function Regions() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌍 Regiones Pokémon</Text>
      <FlatList
        data={REGION_TO_POKEDEX}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={() => router.push(`/region/${item.id}`)}
            style={[
              styles.regionCard,
              { backgroundColor: COLORS[index % COLORS.length] },
            ]}
          >
            <Text style={styles.regionName}>{item.label}</Text>
            <Text style={styles.regionId}>Pokédex ID: {item.id}</Text>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// 🎨 Paleta de colores pastel con acentos vivos
const COLORS = [
  "#dea6feff", // Fondo claro neutro
  "#94d6ffff", // Gris suave
  "rgba(139, 255, 230, 1)", // Rojo brillante
  "#76ffcdff", // Verde acento
  "#fdfd5fff", // Azul acento
  "#ff9c4bff", // Marrón suave
  "#ff786cff", // Verde medio
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0ffe6ff",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#000000ff",
    marginBottom: 16,
    textAlign: "center",
  },
  regionCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: "#000000ff",
    borderWidth: 1,
    borderColor: "#E0E4EB",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  regionName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000ff",
    marginBottom: 4,
  },
  regionId: {
    fontSize: 14,
    color: "#424242ff",
    opacity: 0.9,
  },
});
