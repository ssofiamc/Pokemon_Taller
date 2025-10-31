// app/index.tsx
import React, { useState, useMemo, memo } from "react";
// Importa los hooks y componentes de React necesarios
import {
      View,            // Contenedor visual para layout
      Text,            // Componente para mostrar texto
      TextInput,       // Campo para ingresar texto
      TouchableOpacity, // Botón táctil
      FlatList,        // Lista optimizada para muchos elementos
      StyleSheet,      // Módulo para definir estilos en línea
      Image,           // Componente para mostrar imágenes
} from "react-native";
import { useRouter } from "expo-router"; // Navegación tipo hook router
import useNetworkStatus from "./hooks/useNetworkStatus"; // Hook personalizado para saber si hay internet
import { useFavorites } from "./context/FavoritesContext"; // Hook de contexto de favoritos
import { getTypes } from "./services/pokeApi"; // Servicio para obtener tipos de Pokémon
import useApi from "./hooks/useApi"; // Hook personalizado para llamadas a APIs

// Componente principal de la HomePage
export default function Home() {
  const router = useRouter(); // Hook de navegación
  const { isConnected } = useNetworkStatus(); // Estado de conexión a internet
  const { data: types } = useApi(() => getTypes(), []); // Llama a API para traer tipos
  const [query, setQuery] = useState(""); // Estado para el texto de búsqueda
  const { favorites, favoritesData } = useFavorites(); // Favoritos y sus datos completos

// Función para buscar un Pokémon por nombre/ID
  const onSearch = () => {
    if (!query) return; // Si la búsqueda está vacía, no hace nada
    router.push(`/pokemon/${query.toLowerCase()}`); // Navega a la página del Pokémon buscado
    setQuery(""); // Limpia el campo de búsqueda
  };

  // Componente memoizado que pinta una tarjeta para un Pokémon favorito
  const FavoriteCard = memo(function FavoriteCard({
    item, // Nombre o ID del Pokémon favorito
    d, // Datos completos del favorito
  }: {
    item: string;
    d: any;
  }) {
    const [imageBroken, setImageBroken] = useState(false); // Maneja si la imagen ha fallado al cargar

    const nameOrItem = d?.name || item; // Nombre preferido, usa nombre de datos si existe
    const displayName = useMemo(
      () => (nameOrItem ? nameOrItem.charAt(0).toUpperCase() + nameOrItem.slice(1) : item),
      [nameOrItem, item]
    ); // Capitaliza el nombre que se mostrará

    // Selecciona sprite oficial si existe (preferido)
    const officialArtwork =
      d?.sprites?.other?.["official-artwork"]?.front_default || d?.sprites?.front_default || null;

    // Si no hay sprite cacheado, crea URL estática por nombre
    const fallbackByName =
      nameOrItem && typeof nameOrItem === "string"
        ? `https://img.pokemondb.net/artwork/large/${encodeURIComponent(
            nameOrItem.toLowerCase()
          )}.jpg`
        : null;

    // Usa la imagen preferida disponible, o null si ninguna sirve
    const chosenUri =
      !imageBroken && officialArtwork
        ? officialArtwork
        : !imageBroken && fallbackByName
        ? fallbackByName
        : null;

    // Render de la tarjeta de favorito
    return (
      <TouchableOpacity
        style={styles.favCard}
        onPress={() => router.push(`/pokemon/${item}`)} // Navega al detalle al presionar
        activeOpacity={0.85}
      >
        {chosenUri ? (
          <Image
            source={{ uri: chosenUri }} // Imagen del Pokémon
            style={styles.favImage}
            resizeMode="contain"
            onError={() => setImageBroken(true)} // Si falla la imagen, usa fallback
            accessibilityLabel={`${displayName} imagen`}
          />
        ) : (
          <View style={styles.favPlaceholder}>
            <Text style={styles.favPlaceholderText}>
              {displayName.charAt(0)}
            </Text>
          </View>
        )}

        {/* Metadatos del Pokémon favorito: nombre y número */}
        <View style={styles.favMeta}>
          <Text style={styles.favText} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.favId}>{d?.id ? `#${d.id}` : ""}</Text>
        </View>
      </TouchableOpacity>
    );
  });

  // Render principal de la pantalla
  return (
    <View style={styles.container}>
      {/* Si estamos offline muestra banner */}
      {!isConnected && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>
            🔌 Sin conexión — solo Favoritos disponibles
          </Text>
        </View>
      )}

      {/* Título de la aplicación */}
      <Text style={styles.title}>Pokédex App</Text>
      {/* Barra de búsqueda */}
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

      {/* Botón para navegar a regiones */}
      <TouchableOpacity
        onPress={() => router.push("/regions")}
        style={styles.regionBtn}>
        <Text style={styles.regionBtnText}>🌍 Explorar por Regiones</Text>
      </TouchableOpacity>

      {/* Lista de favoritos */}
      <Text style={styles.sectionTitle}>Favoritos</Text>
      {favorites.length === 0 ? (
        <Text style={styles.emptyText}>No hay favoritos aún.</Text>
      ) : (
        <FlatList
          data={favorites} // Lista de Keys de Pokémon favoritos
          horizontal
          renderItem={({ item }) => {
            const d = favoritesData[item]; // Trae datos completos
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

// Definición de todos los estilos usados en la pantalla.
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
