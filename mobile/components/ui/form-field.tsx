import {
    Control,
    FieldPath,
    FieldValues,
    RegisterOptions,
    useController,
} from "react-hook-form";
import { StyleSheet, Text, TextInput, View } from "react-native";

export type FormFieldProps<T extends FieldValues> = {
  name: FieldPath<T>;
  label: string;
  placeholder: string;
  secureTextEntry?: boolean;
  control: Control<T>;
  rules?: RegisterOptions<T, FieldPath<T>>;
};

export function FormField<T extends FieldValues>({
  name,
  label,
  placeholder,
  secureTextEntry,
  control,
  rules,
}: FormFieldProps<T>) {
  const {
    field: { value, onChange, onBlur },
    fieldState: { error },
  } = useController({ name, control, rules });

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholder={placeholder}
        placeholderTextColor="#9BA1A6"
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={onChange}
        onBlur={onBlur}
      />
      {error && <Text style={styles.errorText}>{error.message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#11181C",
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#11181C",
    backgroundColor: "#F8F9FA",
  },
  inputError: {
    borderColor: "#E53935",
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: "#E53935",
  },
});
