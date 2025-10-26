// app/_layout.tsx
import React from "react";
import { Stack } from "expo-router";
import { SafeAreaView, StatusBar, Platform } from "react-native";
import { FavoritesProvider } from "./context/FavoritesContext";

/**
 * 🎨 Tema visual: Paleta pastel y luminosa
 * Inspirada en la Pokédex App (Dribbble)
 */
export const THEME = {
  background: "#F0F2F6", // Fondo general
  white: "#FFFFFF",
  muted: "#AAB3C7", // Gris pastel suave
  accent: "#37A5C6", // Azul claro (botones, links)
  success: "#14A06F", // Verde acento
  green: "#53A063", // Verde suave (categorías)
  danger: "#F42A28", // Rojo acento (acciones importantes)
  brown: "#716B45", // Marrón neutro (texto principal)
  textPrimary: "#333333",
  textSecondary: "#555555",
};

export default function Layout() {
  return (
    <FavoritesProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: THEME.background }}>
        {/* StatusBar: clara para combinar con la UI */}
        <StatusBar barStyle="dark-content" backgroundColor={THEME.white} />

        <Stack
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
                default: {},
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
