// app/pokemon/[name].tsx
import React, { useEffect, useState } from "react";
// Importa React y hooks de estado y efecto para manejar datos y ciclos de vida
import { View, 
        Text, 
        Image, 
        ScrollView, 
        TouchableOpacity, 
        ActivityIndicator, 
        StyleSheet } from "react-native";
        // Importa componentes UI básicos y el ScrollView para listas desplazables
import { useLocalSearchParams, useRouter } from "expo-router";
// Hook para obtener parámetros de URL y navegación con Expo Router
import useApi from "./../hooks/useApi";
// Hook personalizado para llamadas a API y manejo de estados internos
import { getPokemon, getPokemonSpecies, getEvolutionChainById } from "./../services/pokeApi";
// Funciones para obtener datos específicos desde la API de Pokémon
import { useFavorites } from "./../context/FavoritesContext";
// Contexto para manejo de favoritos global de la app

// Define el tipo de parámetros que espera la pantalla, en este caso el nombre del Pokémon
type Params = {
  name?: string; // nombre opcional del Pokémon que se desea mostrar
};

export default function PokemonDetail() {
  // Obtiene los parámetros de la ruta (nombre del Pokémon)
  const params = useLocalSearchParams<Params>();
  const nameParam = params.name;
  // Hook para navegación programática
  const router = useRouter();
  // Estado para almacenar la cadena de evoluciones (array de nombres)
  const [evolutions, setEvolutions] = useState<string[]>([]);
  // Extraer datos y funciones de favoritos disponibles en contexto
  const { favoritesData, isFavorite, toggleFavorite } = useFavorites();
  // Busca datos cacheados del Pokémon para evitar recargas innecesarias
  const cached = favoritesData?.[String(nameParam).toLowerCase()] || null;
  // Llama a la API para obtener la información del Pokémon, usando hook personalizado
  const { data: pokemon, loading } = useApi(() => getPokemon(nameParam || "1"), [nameParam]);
  // Llama a la API para obtener información adicional (especie) basado en el Id del Pokémon obtenido
  const { data: species } = useApi(
    () => (pokemon ? getPokemonSpecies(pokemon.id) : Promise.reject("no pokemon")),
    [pokemon?.id]
  );

  // useEffect para cargar la cadena de evoluciones cuando cambia la especie
  useEffect(() => {
    async function loadEvo() {
      try {
        // Si la especie tiene URL para cadena de evolución
        if (species && species.evolution_chain?.url) {
          // Extrae el id de la cadena de evolución desde la URL
          const urlParts = species.evolution_chain.url.split("/");
          const id = urlParts[urlParts.length - 2];
          // Llama a la API para obtener la cadena detallada
          const chain = await getEvolutionChainById(id);
          // Lista temporal para almacenar nombres
          const names: string[] = [];
          // Función recursiva para recorrer la cadena de evolución
          function walk(node: any) {
            if (!node) return;
            if (node.species) names.push(node.species.name); // Agrega nombre a la lista
            if (node.evolves_to && node.evolves_to.length) {
              node.evolves_to.forEach((n: any) => walk(n)); // Llama recursivamente a los evolutivos
            }
          }
          walk(chain.chain); // Inicia recorrido en la raíz
          setEvolutions(names); // Guarda nombres en estado
        }
      } catch (err) {
        // Si falla la carga, muestra advertencia en consola
        console.warn("Error cargando evolution chain", err);
      }
    }
    loadEvo(); // Ejecuta la función async
  }, [species]); // Se ejecuta cada vez que cambia la especie

  // Decide qué datos mostrar: datos API o cache del contexto favoritos
  const show = pokemon || cached;
  // Si no hay datos y está cargando, muestra spinner indicador
  if (!show && loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  // Si no hay datos y no está cargando, muestra mensaje de error
  if (!show) return <Text style={{ padding: 12 }}>No se encontró el Pokémon.</Text>;

  // Elige la imagen oficial de mayor calidad o sprite por defecto
  const artwork =
    show.sprites?.other?.["official-artwork"]?.front_default || show.sprites?.front_default;

  return (
    // Vista principal con Scroll vertical para poder mostrar mucha información
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        {/* Imagen principal del Pokémon */}
        <Image source={{ uri: artwork }} style={styles.image} resizeMode="contain" />

        {/* Nombre capitalizado y su ID */}
        <Text style={styles.name}>
          {show.name.charAt(0).toUpperCase() + show.name.slice(1)} <Text style={styles.id}>#{show.id}</Text>
        </Text>
        {/* Botón para alternar favorito, cambia color según estado */}
        <TouchableOpacity
          onPress={() => toggleFavorite(show.name)} // Alterna favorito en el contexto
          style={[
            styles.favoriteBtn,
            { backgroundColor: isFavorite(show.name) ? "#F42A28" : "#3e7d17ff" },
          ]}
        >
          <Text style={styles.favoriteBtnText}>
            {isFavorite(show.name) ? "★ Favorito" : "☆ Agregar a favoritos"}
          </Text>
        </TouchableOpacity>

        {/* Sección: Tipos */}
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

        {/* Sección: Descripción del Pokémon */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.paragraph}>
            {/* Busca la descripción en inglés, limpia espacios extra */}
            {species?.flavor_text_entries?.find((e: any) => e.language.name === "en")?.flavor_text.replace(/\s+/g, " ") ||
              "No hay descripción disponible."}
          </Text>
        </View>

        {/* Sección: Estadísticas base */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estadísticas</Text>
          {show.stats?.map((s: any) => (
            <View key={s.stat.name} style={styles.statRow}>
              <Text style={styles.statName}>{s.stat.name}</Text>
              <Text style={styles.statValue}>{s.base_stat}</Text>
            </View>
          ))}
        </View>

        {/* Sección: Movimientos (los primeros 6) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Movimientos (primeros 6)</Text>
          {show.moves?.slice(0, 6).map((m: any) => (
            <Text key={m.move.name} style={styles.move}>
              • {m.move.name}
            </Text>
          ))}
        </View>

        {/* Sección: Evoluciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Evoluciones</Text>
          <View style={styles.evoRow}>
            {/* Si no hay evoluciones, mensaje */}
            {evolutions.length === 0 ? (
              <Text style={styles.paragraph}>No se han encontrado evoluciones.</Text>
            ) : (
              // Muestra botón para cada nombre de evolución que navega a ese Pokémon
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


// Estilos para toda la pantalla y componentes hijos
const styles = StyleSheet.create({
  container: {
    flex: 1, // Ocupa todo el espacio posible
    backgroundColor: "#dfffcaff", // Fondo verde claro
  },
  card: {
    backgroundColor: "#ffffffff", // Fondo blanco para la tarjeta principal
    margin: 16,
    borderRadius: 24,
    padding: 20,
    alignItems: "center", // Centra horizontalmente sus hijos
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3, // Sombreados para Android
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
