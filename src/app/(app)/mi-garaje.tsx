import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { SectionTitle } from '@/components/SectionTitle';
import { TextField } from '@/components/TextField';
import { CAR_COLORS, Colors, Fonts, UPGRADE_TYPES, upgradeTypeFor } from '@/constants/theme';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { pickAndUploadImage } from '@/lib/upload-image';
import { useGarage } from '@/hooks/useGarage';

export default function MiGarajeScreen() {
  const { session, profile, refreshProfile } = useAuth();
  const { project, progress, comments, loading, saveProject, addProgress, addOwnComment } = useGarage();
  const userId = session?.user.id;

  const [editing, setEditing] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  async function handleAvatarPick() {
    if (!userId) return;
    setAvatarUploading(true);
    const result = await pickAndUploadImage('avatars', userId, 'avatar');
    setAvatarUploading(false);
    if ('url' in result) {
      await supabase.from('profiles').update({ avatar_url: result.url }).eq('id', userId);
      await refreshProfile();
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerFill}>
          <ActivityIndicator color={Colors.accentLime} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <SectionTitle eyebrow="TU PROYECTO" title="Mi Garaje" accent={Colors.accentLime} />

        <View style={styles.avatarRow}>
          <Pressable onPress={handleAvatarPick} style={styles.avatar}>
            {profile?.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarInitial}>{(profile?.display_name ?? '?').slice(0, 1).toUpperCase()}</Text>
            )}
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.avatarLabel}>Foto de perfil</Text>
            <Text style={styles.avatarHint}>Toca el círculo para cambiarla</Text>
            {avatarUploading && <ActivityIndicator size="small" color={Colors.accentLime} style={{ marginTop: 4 }} />}
          </View>
        </View>

        {!editing && project ? (
          <CarSummary project={project} onEdit={() => setEditing(true)} />
        ) : (
          <CarForm
            userId={userId!}
            initial={project}
            onSaved={() => setEditing(false)}
            onSave={saveProject}
          />
        )}

        {project && (
          <>
            <ProgressLog
              userId={userId!}
              progress={progress}
              onAddProgress={addProgress}
            />
            <CommentsSection comments={comments} myName={profile?.display_name} onAddComment={addOwnComment} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function CarSummary({ project, onEdit }: { project: NonNullable<ReturnType<typeof useGarage>['project']>; onEdit: () => void }) {
  return (
    <View style={[styles.card, { borderColor: `${project.color}55`, marginTop: 18 }]}>
      {project.photo_url && <Image source={{ uri: project.photo_url }} style={styles.carPhoto} />}
      <View style={{ padding: 20 }}>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={styles.carName}>{project.nombre}</Text>
            {!!project.specs && <Text style={styles.carSpecs}>{project.specs}</Text>}
          </View>
          <View style={[styles.colorDot, { backgroundColor: project.color }]} />
        </View>
        <Button label="Editar proyecto" variant="outline" onPress={onEdit} style={{ marginTop: 14, alignSelf: 'flex-start' }} />
      </View>
    </View>
  );
}

function CarForm({
  userId,
  initial,
  onSave,
  onSaved,
}: {
  userId: string;
  initial: { nombre: string; specs: string | null; color: string; photo_url: string | null } | null;
  onSave: (input: { nombre: string; specs: string; color: string; photoUrl: string | null }) => Promise<{ error: string | null }>;
  onSaved: () => void;
}) {
  const [nombre, setNombre] = useState(initial?.nombre ?? '');
  const [specs, setSpecs] = useState(initial?.specs ?? '');
  const [color, setColor] = useState(initial?.color ?? CAR_COLORS[0].value);
  const [photoUrl, setPhotoUrl] = useState<string | null>(initial?.photo_url ?? null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePickPhoto() {
    setUploading(true);
    const result = await pickAndUploadImage('garage-photos', userId, 'cover');
    setUploading(false);
    if ('url' in result) setPhotoUrl(result.url);
    if ('error' in result) setError(result.error);
  }

  async function handleSubmit() {
    if (!nombre.trim()) return;
    setSaving(true);
    setError(null);
    const { error: saveError } = await onSave({ nombre: nombre.trim(), specs: specs.trim(), color, photoUrl });
    setSaving(false);
    if (saveError) setError(saveError);
    else onSaved();
  }

  return (
    <View style={[styles.card, { marginTop: 18, padding: 20 }]}>
      <Text style={styles.label}>Foto del carro</Text>
      <Pressable onPress={handlePickPhoto} style={styles.photoPicker}>
        {uploading ? (
          <ActivityIndicator color={Colors.accentLime} />
        ) : photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.photoPreview} />
        ) : (
          <Text style={styles.photoPickerText}>Toca para elegir una foto</Text>
        )}
      </Pressable>

      <TextField
        label="Nombre del proyecto (marca / modelo / año)"
        value={nombre}
        onChangeText={setNombre}
        placeholder="ej. Nissan 240SX '97"
      />
      <TextField
        label="Specs / meta del build"
        value={specs}
        onChangeText={setSpecs}
        placeholder="ej. swap de motor, drift build, show car..."
      />

      <Text style={styles.label}>Color del proyecto</Text>
      <View style={styles.colorRow}>
        {CAR_COLORS.map((c) => (
          <Pressable
            key={c.value}
            onPress={() => setColor(c.value)}
            style={[
              styles.colorSwatch,
              { backgroundColor: c.value },
              color === c.value && styles.colorSwatchSelected,
            ]}
          />
        ))}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <Button
        label="Guardar proyecto"
        onPress={handleSubmit}
        loading={saving}
        disabled={!nombre.trim()}
        style={{ marginTop: 8 }}
      />
    </View>
  );
}

function ProgressLog({
  userId,
  progress,
  onAddProgress,
}: {
  userId: string;
  progress: ReturnType<typeof useGarage>['progress'];
  onAddProgress: (input: { tipo: string; texto: string; photoUrl: string }) => Promise<{ error: string | null; pointsAwarded?: number }>;
}) {
  const [tipo, setTipo] = useState<string>(UPGRADE_TYPES[0].id);
  const [texto, setTexto] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePickPhoto() {
    setUploading(true);
    const result = await pickAndUploadImage('garage-photos', userId, `progress/${Date.now()}`);
    setUploading(false);
    if ('url' in result) setPhotoUrl(result.url);
    if ('error' in result) setError(result.error);
  }

  async function handleSubmit() {
    if (!texto.trim() || !photoUrl) return;
    setPosting(true);
    setError(null);
    const result = await onAddProgress({ tipo, texto: texto.trim(), photoUrl });
    setPosting(false);
    if (result.error) {
      setError(result.error);
    } else {
      setTexto('');
      setPhotoUrl(null);
    }
  }

  return (
    <View style={{ marginTop: 26 }}>
      <Text style={styles.sectionLabel}>Bitácora de avance</Text>

      <View style={[styles.card, { padding: 16 }]}>
        <View style={styles.chipRow}>
          {UPGRADE_TYPES.map((u) => (
            <Pressable
              key={u.id}
              onPress={() => setTipo(u.id)}
              style={[styles.chip, tipo === u.id && styles.chipSelected]}>
              <Text style={[styles.chipText, tipo === u.id && styles.chipTextSelected]}>
                {u.label} (+{u.points})
              </Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          value={texto}
          onChangeText={setTexto}
          placeholder="ej. Instalé el kit de rines nuevos hoy"
          placeholderTextColor={Colors.textMuted}
          style={styles.input}
        />

        <Text style={styles.requiredHint}>FOTO OBLIGATORIA · sin foto no se otorgan puntos</Text>
        <Pressable onPress={handlePickPhoto} style={styles.photoPickerSmall}>
          {uploading ? (
            <ActivityIndicator color={Colors.accentLime} />
          ) : photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.photoPreviewSmall} />
          ) : (
            <Text style={styles.photoPickerText}>Toca para elegir una foto</Text>
          )}
        </Pressable>

        {error && <Text style={styles.error}>{error}</Text>}

        <Button
          label="Publicar mejora"
          variant="orange"
          disabled={!texto.trim() || !photoUrl}
          loading={posting}
          onPress={handleSubmit}
          style={{ marginTop: 12, alignSelf: 'flex-start' }}
        />
      </View>

      {progress.length === 0 ? (
        <Text style={styles.emptyHint}>Todavía no has publicado avances. ¡Cuenta cómo va tu proyecto!</Text>
      ) : (
        <View style={{ gap: 8, marginTop: 12 }}>
          {progress.map((p) => (
            <View key={p.id} style={styles.card}>
              <Image source={{ uri: p.photo_url }} style={styles.progressPhoto} />
              <View style={{ padding: 12 }}>
                <View style={styles.rowBetween}>
                  <Text style={styles.dateText}>{new Date(p.created_at).toLocaleDateString('es-MX')}</Text>
                  <Text style={styles.tipoText}>{upgradeTypeFor(p.tipo).label.toUpperCase()}</Text>
                </View>
                <Text style={styles.progressText}>{p.texto}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function CommentsSection({
  comments,
  myName,
  onAddComment,
}: {
  comments: ReturnType<typeof useGarage>['comments'];
  myName?: string;
  onAddComment: (text: string) => Promise<{ error: string | null }>;
}) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (!text.trim()) return;
    setSending(true);
    const { error } = await onAddComment(text.trim());
    setSending(false);
    if (!error) setText('');
  }

  return (
    <View style={{ marginTop: 26, marginBottom: 40 }}>
      <Text style={styles.sectionLabel}>Comentarios ({comments.length})</Text>

      <View style={styles.commentRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Escribe un comentario..."
          placeholderTextColor={Colors.textMuted}
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
        />
        <Pressable onPress={handleSend} style={styles.sendButton} disabled={sending}>
          {sending ? <ActivityIndicator size="small" color={Colors.background} /> : <Text style={styles.sendText}>Enviar</Text>}
        </Pressable>
      </View>

      {comments.length === 0 ? (
        <Text style={styles.emptyHint}>Todavía no hay comentarios en tu proyecto.</Text>
      ) : (
        <View style={{ gap: 8, marginTop: 12 }}>
          {comments.map((c) => (
            <View key={c.id} style={[styles.card, { padding: 12 }]}>
              <Text style={styles.commentAuthor}>
                {myName ?? 'Tú'} <Text style={styles.commentDate}>{new Date(c.created_at).toLocaleDateString('es-MX')}</Text>
              </Text>
              <Text style={styles.commentText}>{c.text}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  centerFill: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, paddingBottom: 60 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 18 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: Colors.accentLime,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarInitial: { fontFamily: Fonts.display, fontSize: 22, color: Colors.textMuted },
  avatarLabel: { fontSize: 13, color: Colors.text },
  avatarHint: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  carPhoto: { width: '100%', height: 180 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  carName: { fontFamily: Fonts.display, fontSize: 22, color: Colors.text },
  carSpecs: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  colorDot: { width: 20, height: 20, borderRadius: 4 },
  label: { fontSize: 12, color: Colors.textSecondary, marginBottom: 6 },
  photoPicker: {
    height: 140,
    borderRadius: 4,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    overflow: 'hidden',
  },
  photoPreview: { width: '100%', height: '100%' },
  photoPickerText: { color: Colors.textMuted, fontSize: 13 },
  colorRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  colorSwatch: { width: 30, height: 30, borderRadius: 4, borderWidth: 2, borderColor: 'transparent' },
  colorSwatchSelected: { borderColor: Colors.text },
  error: { color: Colors.accentRed, fontSize: 13, marginBottom: 8 },
  sectionLabel: {
    fontFamily: Fonts.displaySemibold,
    fontSize: 15,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  chip: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chipSelected: { backgroundColor: Colors.accentOrange, borderColor: Colors.accentOrange },
  chipText: { fontSize: 12, color: Colors.textSecondary },
  chipTextSelected: { color: Colors.background, fontWeight: '700' },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: Colors.text,
    fontSize: 14,
    marginBottom: 10,
  },
  requiredHint: { fontSize: 11, color: Colors.accentOrange, marginBottom: 6, letterSpacing: 0.5 },
  photoPickerSmall: {
    height: 100,
    borderRadius: 4,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  photoPreviewSmall: { width: '100%', height: '100%' },
  progressPhoto: { width: '100%', height: 160 },
  dateText: { fontFamily: Fonts.mono, fontSize: 11, color: Colors.textMuted },
  tipoText: { fontFamily: Fonts.mono, fontSize: 10, color: Colors.accentOrange, letterSpacing: 0.5 },
  progressText: { fontSize: 14, color: Colors.text, marginTop: 4 },
  emptyHint: { color: Colors.textMuted, fontSize: 13, marginTop: 8 },
  commentRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  sendButton: {
    backgroundColor: Colors.accentBlue,
    borderRadius: 4,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: { color: Colors.background, fontFamily: Fonts.displaySemibold, fontSize: 13, textTransform: 'uppercase' },
  commentAuthor: { fontFamily: Fonts.displaySemibold, fontSize: 13, color: Colors.accentBlue },
  commentDate: { fontFamily: Fonts.mono, fontSize: 11, color: Colors.textMuted },
  commentText: { fontSize: 14, color: Colors.text, marginTop: 2 },
});
