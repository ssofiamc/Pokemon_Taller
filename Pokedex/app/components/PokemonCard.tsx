// components/PokemonCard.tsx
import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useFavorites } from "../context/FavoritesContext";
import { THEME } from "./../_layout";

type Props = {
  id: number; // puede ser entry_number (regional) o national id; no lo usamos como fallback numérico
  name: string;
  sprites?: any;
  types?: { type: { name: string } }[];
};

export default function PokemonCard({ id, name, sprites, types }: Props) {
  const router = useRouter();
  const { toggleFavorite, isFavorite } = useFavorites();
  const fav = isFavorite(name);

  const [imageBroken, setImageBroken] = useState(false);

  // Resetea el flag de imagen rota cuando cambian nombre o sprites (evita "arrastre" entre regiones)
  useEffect(() => {
    setImageBroken(false);
  }, [name, sprites]);

  // Preferimos artwork oficial del objeto `sprites` si está disponible
  const officialArtwork = useMemo(
    () =>
      sprites?.other?.["official-artwork"]?.front_default ||
      sprites?.front_default ||
      null,
    [sprites]
  );

  // Fallback basado en *nombre* (más seguro que usar index regional)
  // img.pokemondb.net suele tener artwork por nombre en minúsculas.
  const fallbackByName = useMemo(() => {
    if (!name) return null;
    // normalizamos el nombre para la URL (minusculas). Ajusta si tus nombres vienen con formas especiales.
    const safeName = encodeURIComponent(name.toLowerCase());
    return `https://img.pokemondb.net/artwork/large/${safeName}.jpg`;
  }, [name]);

  const displayName = useMemo(
    () => (name ? name.charAt(0).toUpperCase() + name.slice(1) : ""),
    [name]
  );

  // Escogemos la uri efectiva: primero el artwork del objeto sprites, si no, el fallback por nombre
  const chosenUri =
    !imageBroken && typeof officialArtwork === "string" && officialArtwork.length > 0
      ? officialArtwork
      : !imageBroken && fallbackByName
      ? fallbackByName
      : null;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/pokemon/${name}`)}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`Ir a la ficha de ${displayName}`}
      activeOpacity={0.85}
    >
      <View style={styles.spriteContainer}>
        {chosenUri ? (
          <Image
            source={{ uri: chosenUri }}
            style={styles.sprite}
            resizeMode="contain"
            onError={() => {
              // si la imagen no carga marcamos como rota para no reintentar infinitamente
              setImageBroken(true);
            }}
            accessibilityLabel={`${displayName} imagen`}
          />
        ) : (
          <View style={styles.placeholder} accessibilityLabel="Imagen no disponible">
            <Text style={styles.placeholderText}>{displayName.charAt(0)}</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.idText}>#{id}</Text>
        </View>

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
    borderRadius: 78 / 2,
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
    borderRadius: 64 / 2,
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
    color: THEME.muted ? THEME.muted : "#9AA0A6",
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
