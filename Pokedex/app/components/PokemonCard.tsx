// components/PokemonCard.tsx
import React, { useMemo, useState, useEffect } from "react";
// Importa React y los hooks para manejo de estado, memorization y efectos secundarios
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
// Componentes base para construir la UI en React Native
import { useRouter } from "expo-router";
// Hook para navegación programática
import { useFavorites } from "../context/FavoritesContext";
// Hook personalizado para manejar la lógica de favoritos
import { THEME } from "./../_layout";
// Importa la paleta de colores y estilos globales

// Define las props que el componente recibe con tipos
type Props = {
  id: number; // ID del Pokémon (puede ser regional o nacional)
  name: string; // Nombre del Pokémon
  sprites?: any; // Objeto con imágenes y sprites del Pokémon
  types?: { type: { name: string } }[]; // Array con los tipos (agua, fuego, etc.)
};

export default function PokemonCard({ id, name, sprites, types }: Props) {
  const router = useRouter(); // Hook para navegación
  const { toggleFavorite, isFavorite } = useFavorites(); // Manejo de favoritos
  const fav = isFavorite(name); // Verifica si el Pokémon está en favoritos

  const [imageBroken, setImageBroken] = useState(false);
  // Estado para detectar si la imagen ha fallado al cargar y evitar reintentos infinitos

  // Efecto que reinicia el flag de imagen rota cuando cambia nombre o sprites
  useEffect(() => {
    setImageBroken(false);
  }, [name, sprites]);

  // Memoiza la URI del artwork oficial para mejorar rendimiento
  const officialArtwork = useMemo(
    () =>
      sprites?.other?.["official-artwork"]?.front_default ||
      sprites?.front_default ||
      null,
    [sprites]
  );

  // Memoiza la URL fallback basada en el nombre para imagen si no hay artwork oficial
  const fallbackByName = useMemo(() => {
    if (!name) return null;
    const safeName = encodeURIComponent(name.toLowerCase()); // Normaliza nombre para URL
    return `https://img.pokemondb.net/artwork/large/${safeName}.jpg`;
  }, [name]);

  // Selecciona la URI de imagen que se mostrará:
  // Prefiere artwork oficial, si no disponible usa fallback, si imagen rota no muestra nada
  const chosenUri =
    !imageBroken && typeof officialArtwork === "string" && officialArtwork.length > 0
      ? officialArtwork
      : !imageBroken && fallbackByName
      ? fallbackByName
      : null;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/pokemon/${name}`)} // Navega a detalle al presionar tarjeta
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`Ir a la ficha de ${name.charAt(0).toUpperCase() + name.slice(1)}`}
      activeOpacity={0.85}
    >
      <View style={styles.spriteContainer}>
        {/* Imagen del Pokémon o marcador si no hay imagen */}
        {chosenUri ? (
          <Image
            source={{ uri: chosenUri }}
            style={styles.sprite}
            resizeMode="contain"
            onError={() => setImageBroken(true)} // Marca imagen rota si falla
            accessibilityLabel={`${name.charAt(0).toUpperCase() + name.slice(1)} imagen`}
          />
        ) : (
          <View style={styles.placeholder} accessibilityLabel="Imagen no disponible">
            <Text style={styles.placeholderText}>{name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <View style={styles.headerRow}>
          {/* Nombre con mayúscula inicial */}
          <Text style={styles.name} numberOfLines={1}>
            {name.charAt(0).toUpperCase() + name.slice(1)}
          </Text>
          {/* ID del Pokémon */}
          <Text style={styles.idText}>#{id}</Text>
        </View>

        {/* Tipos del Pokémon */}
        <View style={styles.typesRow}>
          {types?.map((t) => (
            <View key={t.type.name} style={styles.typePill}>
              <Text style={styles.typeText}>
                {t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Botón para agregar o quitar de favoritos */}
      <TouchableOpacity
        onPress={() => toggleFavorite(name)}
        style={[styles.favorite, fav ? styles.favOn : styles.favOff]}
        accessibilityLabel={fav ? "Quitar favorito" : "Agregar a favoritos"}
        accessibilityRole="button"
        activeOpacity={0.8}
      >
        <Text style={[styles.favText, fav ? styles.favTextOn : styles.favTextOff]}>
          {fav ? "♥" : "♡"}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

// Estilos para el componente carta Pokémon
const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",       
    backgroundColor: THEME.white,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginVertical: 8,
    marginHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F2F2F2",
    ...Platform.select({        
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  spriteContainer: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: THEME.background,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",         
  },
  sprite: {
    width: 64,
    height: 64,
    backgroundColor: "transparent",
  },
  placeholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E6E9EE",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#9AA0A6",
  },
  info: {
    marginLeft: 14,
    flex: 1,
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  name: {
    fontSize: 17,
    fontWeight: "700",
    color: THEME.brown,
    letterSpacing: 0.2,
    flexShrink: 1,            
  },
  idText: {
    fontSize: 13,
    color: THEME.muted || "#9AA0A6",
    marginLeft: 8,
    opacity: 0.9,
  },
  typesRow: {
    flexDirection: "row",
    marginTop: 8,
    flexWrap: "wrap",
  },
  typePill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,        
    backgroundColor: THEME.muted,
    marginRight: 8,
    marginBottom: 6,
    minHeight: 28,
    justifyContent: "center",
  },
  typeText: {
    fontSize: 12,
    color: THEME.white,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  favorite: {
    position: "absolute",
    right: 12,
    top: 12,
    padding: 8,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  favOn: {
    backgroundColor: THEME.danger,
  },
  favOff: {
    backgroundColor: THEME.background, 
  },
  favText: {
    fontSize: 14,
    fontWeight: "700",
  },
  favTextOn: {
    color: THEME.white,
  },
  favTextOff: {
    color: THEME.brown,
  },
});
