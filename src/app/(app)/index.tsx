import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { PointsBadge } from '@/components/PointsBadge';
import { Colors, Fonts } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';

const COMING_SOON = [
  { label: 'Autos', sub: 'Compra y venta', accent: Colors.accentLime },
  { label: 'Mecánica', sub: 'Reserva un servicio', accent: Colors.accentRed },
  { label: 'Accesorios', sub: 'Tienda del club', accent: Colors.accentLime },
];

export default function GarageHomeScreen() {
  const { profile, signOut } = useAuth();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.hello}>{profile?.display_name ?? '...'}</Text>
            <PointsBadge points={profile?.points ?? 0} />
          </View>
          <Button label="Salir" variant="outline" onPress={signOut} style={styles.logoutButton} />
        </View>

        <Text style={styles.eyebrow}>TALLER Y CLUB DE CUSTOM</Text>
        <Text style={styles.title}>Tu carro, a otro nivel.</Text>
        <Text style={styles.subtitle}>
          Arma tu proyecto en Mi Garaje: sube tu carro, publica tus avances y gana puntos.
        </Text>

        <Button label="Ir a Mi Garaje" onPress={() => router.push('/mi-garaje')} style={styles.cta} />

        <Text style={styles.sectionLabel}>PRÓXIMAMENTE</Text>
        <View style={styles.doorsRow}>
          {COMING_SOON.map((door) => (
            <View key={door.label} style={styles.door}>
              <Text style={[styles.doorAccent, { color: door.accent }]}>BAHÍA</Text>
              <Text style={styles.doorLabel}>{door.label}</Text>
              <Text style={styles.doorSub}>{door.sub}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 60 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  hello: { fontFamily: Fonts.display, fontSize: 20, color: Colors.text },
  logoutButton: { paddingVertical: 8, paddingHorizontal: 12 },
  eyebrow: { fontFamily: Fonts.mono, fontSize: 12, letterSpacing: 2, color: Colors.accentRed },
  title: {
    fontFamily: Fonts.display,
    fontSize: 38,
    color: Colors.text,
    textTransform: 'uppercase',
    marginVertical: 6,
    lineHeight: 40,
  },
  subtitle: { color: Colors.textSecondary, fontSize: 15, marginBottom: 20, lineHeight: 21 },
  cta: { marginBottom: 32, alignSelf: 'flex-start', paddingHorizontal: 24 },
  sectionLabel: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    letterSpacing: 2,
    color: Colors.textMuted,
    marginBottom: 12,
  },
  doorsRow: { gap: 12 },
  door: {
    height: 96,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    padding: 16,
    opacity: 0.6,
  },
  doorAccent: { fontFamily: Fonts.mono, fontSize: 10, letterSpacing: 2, marginBottom: 2 },
  doorLabel: { fontFamily: Fonts.display, fontSize: 20, color: Colors.text, textTransform: 'uppercase' },
  doorSub: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
});
