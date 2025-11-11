// app/regions.tsx
import React from "react";
<<<<<<< Updated upstream
// Importa React para crear el componente funcional
import { View, 
        Text, 
        FlatList, 
        TouchableOpacity, 
        StyleSheet } from "react-native";
// Importa componentes básicos de React Native para UI
import { useRouter } from "expo-router"; // Importa el hook de navegación de Expo Router
=======
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

/**
 * Lista de regiones.
 */
>>>>>>> Stashed changes

// Define las regiones Pokémon con su clave, etiqueta y ID de Pokédex
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

// Componente principal de la pantalla de regiones
export default function Regions() {
  const router = useRouter(); // Hook para la navegación programática

  return (
    <View style={styles.container}>
      {/* Título de la pantalla */}
      <Text style={styles.title}>🌍 Regiones Pokémon</Text>
      {/* Lista de regiones usando FlatList para rendimiento y scroll */}
      <FlatList
        data={REGION_TO_POKEDEX} // Fuente de datos, array de regiones
        keyExtractor={(i) => String(i.id)} // Cada item usa su ID como clave única
        renderItem={({ item, index }) => (
          // Cada región es una tarjeta táctil
          <TouchableOpacity
            onPress={() => router.push(`/region/${item.id}`)} // Navega a la pantalla de la región al tocar
            style={[
              styles.regionCard,
              { backgroundColor: COLORS[index % COLORS.length] }, // Color de fondo según la posición
            ]}>
              {/* Nombre visual de la región */}
            <Text style={styles.regionName}>{item.label}</Text>
            {/* ID visual de la región */}
            <Text style={styles.regionId}>Pokédex ID: {item.id}</Text>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false} // Oculta scroll visual vertical
      />
    </View>
  );
}

// Definición de colores para las tarjetas de región
const COLORS = [
  "#dea6feff", // Fondo claro neutro
  "#94d6ffff", // Gris suave
  "rgba(139, 255, 230, 1)", // Rojo brillante
  "#76ffcdff", // Verde acento
  "#fdfd5fff", // Azul acento
  "#ff9c4bff", // Marrón suave
  "#ff786cff", // Verde medio
];

// Estilos visuales declarados con StyleSheet para toda la pantalla y los componentes
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
