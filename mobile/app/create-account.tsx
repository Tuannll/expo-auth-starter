import { Link } from "expo-router";
import { useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { FormField } from "@/components/ui/form-field";
import { useAuthStore } from "@/store/useAuthStore";
import { CreateAccountFormValues } from "@/types/auth";

export default function CreateAccountScreen() {
  const register = useAuthStore((state) => state.register);
  const { control, handleSubmit, getValues, setError, formState: { isSubmitting } } = useForm<CreateAccountFormValues>({
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: CreateAccountFormValues) => {
    try {
      await register(data.email.trim(), data.password);
    } catch (error) {
      setError("email", { message: error instanceof Error ? error.message : "Không thể tạo tài khoản." });
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={styles.inner}>
        <Text style={styles.title}>Tạo tài khoản</Text>
        <Text style={styles.subtitle}>Dùng ít nhất 12 ký tự cho mật khẩu.</Text>
        <FormField name="email" label="Email" placeholder="you@example.com" control={control} rules={{ required: "Vui lòng nhập email." }} />
        <FormField name="password" label="Mật khẩu" placeholder="Ít nhất 12 ký tự" secureTextEntry control={control} rules={{ required: "Vui lòng nhập mật khẩu.", minLength: { value: 12, message: "Mật khẩu phải có ít nhất 12 ký tự." } }} />
        <FormField name="confirmPassword" label="Xác nhận mật khẩu" placeholder="Nhập lại mật khẩu" secureTextEntry control={control} rules={{ required: "Vui lòng xác nhận mật khẩu.", validate: (value: string) => value === getValues("password") || "Mật khẩu xác nhận không khớp." }} />
        <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)} disabled={isSubmitting} activeOpacity={0.8}>
          <Text style={styles.buttonText}>{isSubmitting ? "Đang tạo..." : "Đăng ký"}</Text>
        </TouchableOpacity>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Đã có tài khoản? </Text>
          <Link href="/sign-in" asChild><TouchableOpacity><Text style={styles.footerLink}>Đăng nhập</Text></TouchableOpacity></Link>
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
