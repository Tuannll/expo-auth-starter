import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useAuthStore } from "@/store/useAuthStore";

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const loadProfile = useAuthStore((state) => state.loadProfile);
  const logout = useAuthStore((state) => state.logout);
  const [profileEmail, setProfileEmail] = useState<string>();

  useEffect(() => {
    void loadProfile().then((profile) => setProfileEmail(profile.email)).catch(() => undefined);
  }, [loadProfile]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đã đăng nhập</Text>
      <Text style={styles.text}>{profileEmail ?? user?.email ?? <ActivityIndicator />}</Text>
      <TouchableOpacity style={styles.button} onPress={() => void logout()}><Text style={styles.buttonText}>Đăng xuất</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, padding: 28 },
  title: { color: "#11181C", fontSize: 28, fontWeight: "700" },
  text: { color: "#687076", fontSize: 16 },
  button: { backgroundColor: "#0a7ea4", borderRadius: 10, paddingHorizontal: 20, paddingVertical: 14 },
  buttonText: { color: "#fff", fontWeight: "700" },
});
