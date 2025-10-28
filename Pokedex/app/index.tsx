// app/index.tsx
import React, { useState, useMemo, memo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import useNetworkStatus from "./hooks/useNetworkStatus";
import { useFavorites } from "./context/FavoritesContext";
import { getTypes } from "./services/pokeApi";
import useApi from "./hooks/useApi";

export default function Home() {
  const router = useRouter();
  const { isConnected } = useNetworkStatus();
  const { data: types } = useApi(() => getTypes(), []);
  const [query, setQuery] = useState("");
  const { favorites, favoritesData } = useFavorites();

  const onSearch = () => {
    if (!query) return;
    router.push(`/pokemon/${query.toLowerCase()}`);
    setQuery("");
  };

  // Item visual para cada favorito — memoizado
  const FavoriteCard = memo(function FavoriteCard({
    item,
    d,
  }: {
    item: string;
    d: any;
  }) {
    const [imageBroken, setImageBroken] = useState(false);

    const nameOrItem = d?.name || item;
    const displayName = useMemo(
      () => (nameOrItem ? nameOrItem.charAt(0).toUpperCase() + nameOrItem.slice(1) : item),
      [nameOrItem, item]
    );

    // preferimos sprite cacheado
    const officialArtwork =
      d?.sprites?.other?.["official-artwork"]?.front_default || d?.sprites?.front_default || null;

    // fallback por nombre (si no hay sprite cacheado)
    const fallbackByName =
      nameOrItem && typeof nameOrItem === "string"
        ? `https://img.pokemondb.net/artwork/large/${encodeURIComponent(
            nameOrItem.toLowerCase()
          )}.jpg`
        : null;

    const chosenUri =
      !imageBroken && officialArtwork
        ? officialArtwork
        : !imageBroken && fallbackByName
        ? fallbackByName
        : null;

    return (
      <TouchableOpacity
        style={styles.favCard}
        onPress={() => router.push(`/pokemon/${item}`)}
        activeOpacity={0.85}
      >
        {chosenUri ? (
          <Image
            source={{ uri: chosenUri }}
            style={styles.favImage}
            resizeMode="contain"
            onError={() => setImageBroken(true)}
            accessibilityLabel={`${displayName} imagen`}
          />
        ) : (
          <View style={styles.favPlaceholder}>
            <Text style={styles.favPlaceholderText}>
              {displayName.charAt(0)}
            </Text>
          </View>
        )}

        <View style={styles.favMeta}>
          <Text style={styles.favText} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.favId}>{d?.id ? `#${d.id}` : ""}</Text>
        </View>
      </TouchableOpacity>
    );
  });

  return (
    <View style={styles.container}>
      {!isConnected && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>
            🔌 Sin conexión — solo Favoritos disponibles
          </Text>
        </View>
      )}

      <Text style={styles.title}>Pokédex App</Text>

      <View style={styles.row}>
        <TextInput
          placeholder="Buscar por nombre o ID"
          value={query}
          onChangeText={setQuery}
          style={styles.input}
          onSubmitEditing={onSearch}
          returnKeyType="search"
          placeholderTextColor="#AAB3C7"
        />
        <TouchableOpacity onPress={onSearch} style={styles.searchBtn}>
          <Text style={styles.searchBtnText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => router.push("/regions")}
        style={styles.regionBtn}
      >
        <Text style={styles.regionBtnText}>🌍 Explorar por Regiones</Text>
      </TouchableOpacity>


      <Text style={styles.sectionTitle}>Favoritos</Text>
      {favorites.length === 0 ? (
        <Text style={styles.emptyText}>No hay favoritos aún.</Text>
      ) : (
        <FlatList
          data={favorites}
          horizontal
          renderItem={({ item }) => {
            const d = favoritesData[item];
            return <FavoriteCard item={item} d={d} />;
          }}
          keyExtractor={(i) => i}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 16 }}
        />
      )}
    </View>
  );
}

// 🎨 Paleta mejorada — luminosa y moderna
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0ffe6ff",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#000000ff",
    marginBottom: 16,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    borderRadius: 12,
    marginRight: 8,
    height: 48,
    borderWidth: 1,
    borderColor: "#3e7d17ff",
  },
  searchBtn: {
    backgroundColor: "#3e7d17ff",
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  searchBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  regionBtn: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3e7d17ff",
  },
  regionBtnText: {
    color: "#716B45",
    fontWeight: "600",
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: "700",
    fontSize: 18,
    color: "#3e7d17ff",
  },
  typePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 50,
    backgroundColor: "#AAB3C7",
    marginRight: 10,
  },
  typeText: {
    color: "#FFFFFF",
    fontWeight: "600",
    textTransform: "capitalize",
  },

  /* Favoritos: nuevo estilo con imagen + meta */
  favCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E0E4EB",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    minWidth: 140,
  },
  favImage: {
    width: 56,
    height: 56,
    borderRadius: 56 / 2,
    marginRight: 12,
    backgroundColor: "#F5F7FA",
  },
  favPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 56 / 2,
    marginRight: 12,
    backgroundColor: "#E6E9EE",
    justifyContent: "center",
    alignItems: "center",
  },
  favPlaceholderText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#9AA0A6",
  },
  favMeta: {
    flex: 1,
    justifyContent: "center",
  },
  favText: {
    color: "#000000ff",
    fontWeight: "700",
    fontSize: 14,
  },
  favId: {
    marginTop: 4,
    color: "#AAB3C7",
    fontSize: 12,
    fontWeight: "600",
  },

  emptyText: {
    color: "#AAB3C7",
    fontStyle: "italic",
  },
  offlineBanner: {
    backgroundColor: "#F42A28",
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  offlineText: {
    color: "#000000ff",
    fontWeight: "600",
    textAlign: "center",
  },
});
