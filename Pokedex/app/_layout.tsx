// app/_layout.tsx
import React from "react"; // Importa React para JSX
import { Stack } from "expo-router"; // Importa el componente de navegación tipo Stack
import { SafeAreaView, StatusBar, Platform } from "react-native";
// Importa SafeAreaView para áreas seguras en pantalla, StatusBar para configurar la barra superior, Platform para diferenciar estilos entre plataformas
import { FavoritesProvider } from "./context/FavoritesContext";
// Provider de contexto para manejar favoritos en toda la app

// Definición de una paleta de colores y theme global de la app
export const THEME = {
  background: "#f0ffe6ff", // Fondo general
  white: "#FFFFFF", // Blanco puro
  muted: "#AAB3C7", // Gris pastel suave
  accent: "#37A5C6", // Azul claro (botones, links)
  success: "#14A06F", // Verde acento
  green: "#53A063", // Verde suave (categorías)
  danger: "#F42A28", // Rojo acento (acciones importantes)
  brown: "#000000ff", // Marrón neutro (texto principal)
  textPrimary: "#333333", // Texto oscuro principal
  textSecondary: "#555555", // Texto secundario
};

// Componente principal de layout
export default function Layout() {
  return (
    // Provee contexto de favoritos a toda la app (todos los hijos de Layout)
    <FavoritesProvider>
      {/* SafeAreaView asegura que los contenidos estén dentro del área segura de la pantalla */}
      <SafeAreaView style={{ flex: 1, backgroundColor: THEME.background }}>
        {/* Configura la barra de estado superior (hora, red, batería) con fondo y color de texto */}
        <StatusBar barStyle="dark-content" backgroundColor={THEME.white} />
        {/* Elemento de navegación tipo pila (Stack) con opciones visuales globales */}
        <Stack
        // screenOptions ajusta apariencia y comportamiento de todas las pantallas de este stack
          screenOptions={{
            headerStyle: {
              backgroundColor: THEME.white,
              // Sombra multiplataforma: shadow en iOS, elevation en Android
              ...Platform.select({
                ios: {
                  shadowColor: "#000",
                  shadowOpacity: 0.06,
                  shadowOffset: { width: 0, height: 6 },
                  shadowRadius: 8,
                },
                android: {
                  elevation: 3,
                },
                default: {}, // Por si se usa otra plataforma
              }),
            },
            // color para iconos/button del header
            headerTintColor: THEME.accent,
            headerTitleStyle: {
              fontWeight: "700",
              fontSize: 18,
              color: THEME.brown,
            },
            headerTitleAlign: "center",
            // background para las pantallas (content)
            contentStyle: {
              backgroundColor: THEME.background,
            },
            animation: "fade",
          }}
        />
      </SafeAreaView>
    </FavoritesProvider>
  );
}
