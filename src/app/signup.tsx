import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { Colors, Fonts } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';

export default function SignupScreen() {
  const { signUp } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!displayName.trim() || !email.trim() || password.length < 6) {
      setError('Nombre de corredor, correo y una contraseña de al menos 6 caracteres.');
      return;
    }
    setLoading(true);
    setError(null);
    const { error: signUpError } = await signUp({
      email: email.trim(),
      password,
      displayName: displayName.trim(),
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError);
    } else {
      setConfirmationSent(true);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.eyebrow}>ÚNETE AL CLUB</Text>
          <Text style={styles.title}>Crea tu cuenta</Text>

          {confirmationSent ? (
            <Text style={styles.success}>
              Revisa tu correo ({email.trim()}) para confirmar tu cuenta y luego inicia sesión.
            </Text>
          ) : (
            <>
              <TextField
                label="Nombre de corredor"
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="ej. Razor, Ghost, Nena..."
              />
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
                placeholder="mínimo 6 caracteres"
              />

              {error && <Text style={styles.error}>{error}</Text>}

              <Button label="Crear cuenta" onPress={handleSubmit} loading={loading} style={styles.button} />
            </>
          )}

          <Link href="/login" style={styles.link}>
            <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
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
    borderColor: 'rgba(198,255,61,0.2)',
    borderRadius: 8,
    padding: 28,
  },
  eyebrow: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    letterSpacing: 3,
    color: Colors.accentLime,
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
  success: { color: Colors.accentLime, fontSize: 14, marginBottom: 8, lineHeight: 20 },
  link: { marginTop: 16, alignSelf: 'center' },
  linkText: { color: Colors.accentBlue, fontSize: 13 },
});
