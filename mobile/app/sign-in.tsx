import { Link } from "expo-router";
import { useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { FormField } from "@/components/ui/form-field";
import { useAuthStore } from "@/store/useAuthStore";
import { SignInFormValues } from "@/types/auth";

export default function SignInScreen() {
  const login = useAuthStore((state) => state.login);
  const { control, handleSubmit, setError, formState: { isSubmitting } } = useForm<SignInFormValues>({
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: SignInFormValues) => {
    try {
      await login(data.email.trim(), data.password);
    } catch (error) {
      setError("password", { message: error instanceof Error ? error.message : "Không thể đăng nhập." });
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={styles.inner}>
        <Text style={styles.title}>Đăng nhập</Text>
        <Text style={styles.subtitle}>Chào mừng bạn trở lại!</Text>
        <FormField name="email" label="Email" placeholder="you@example.com" control={control} rules={{ required: "Vui lòng nhập email." }} />
        <FormField name="password" label="Mật khẩu" placeholder="Ít nhất 12 ký tự" secureTextEntry control={control} rules={{ required: "Vui lòng nhập mật khẩu." }} />
        <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)} disabled={isSubmitting} activeOpacity={0.8}>
          <Text style={styles.buttonText}>{isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}</Text>
        </TouchableOpacity>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Chưa có tài khoản? </Text>
          <Link href="/create-account" asChild><TouchableOpacity><Text style={styles.footerLink}>Đăng ký</Text></TouchableOpacity></Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  inner: { flex: 1, justifyContent: "center", paddingHorizontal: 28 },
  title: { fontSize: 32, fontWeight: "700", color: "#11181C", marginBottom: 6 },
  subtitle: { fontSize: 16, color: "#687076", marginBottom: 36 },
  button: { height: 52, backgroundColor: "#0a7ea4", borderRadius: 10, alignItems: "center", justifyContent: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 28 },
  footerText: { color: "#687076", fontSize: 14 },
  footerLink: { color: "#0a7ea4", fontSize: 14, fontWeight: "600" },
});
