import {
  Kanit_400Regular,
  Kanit_700Bold,
  useFonts,
} from "@expo-google-fonts/kanit";

import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  //------------------------------------------------
  const [fontsLoaded] = useFonts({
    Kanit_400Regular,
    Kanit_700Bold,
  });

  useEffect(() => {
    async function prepare() {
      if (fontsLoaded) {
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  //------------------------------------------------

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#2ecc71", // เปลี่ยนจากสีน้ำเงิน (#1619ec) เป็นสีเขียว
        },
        headerTitleStyle: {
          fontSize: 20,
          color: "#fff", // สีข้อความหัวข้อเป็นสีขาว
        },
        headerTitleAlign: "center",
        headerTintColor: "#fff", // สีปุ่ม back และปุ่มต่างๆ ใน header
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="run" options={{ title: "Run Tracker V.1.0.0" }} />
      <Stack.Screen name="add" options={{ title: "เพิ่มรายการวิ่ง" }} />
      <Stack.Screen name="[id]" options={{ title: "รายละเอียดการวิ่ง" }} />
    </Stack>
  );
}
