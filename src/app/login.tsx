import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { Colors, Fonts } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!email.trim() || !password) return;
    setLoading(true);
    setError(null);
    const { error: signInError } = await signIn({ email: email.trim(), password });
    setLoading(false);
    if (signInError) setError(signInError);
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.eyebrow}>ENTRA AL CLUB</Text>
          <Text style={styles.title}>La Bella Máquina</Text>

          <TextField
            label="Correo"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="tu@correo.com"
          />
          <TextField
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <Button label="Entrar al garage" onPress={handleSubmit} loading={loading} style={styles.button} />

          <Link href="/signup" style={styles.link}>
            <Text style={styles.linkText}>¿Nuevo en el club? Crea tu cuenta</Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,122,0,0.25)',
    borderRadius: 8,
    padding: 28,
  },
  eyebrow: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    letterSpacing: 3,
    color: Colors.accentOrange,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: 28,
    color: Colors.text,
    textTransform: 'uppercase',
    marginTop: 6,
    marginBottom: 20,
  },
  button: { marginTop: 6 },
  error: { color: Colors.accentRed, fontSize: 13, marginBottom: 12 },
  link: { marginTop: 16, alignSelf: 'center' },
  linkText: { color: Colors.accentBlue, fontSize: 13 },
});
