import { decode } from 'base64-arraybuffer';
import * as ImagePicker from 'expo-image-picker';

import { supabase } from '@/lib/supabase';

type PickAndUploadResult = { url: string } | { canceled: true } | { error: string };

/**
 * Opens the photo library, uploads the picked image to a Supabase Storage
 * bucket at `${userId}/${pathSuffix}`, and returns its public URL.
 */
export async function pickAndUploadImage(
  bucket: 'avatars' | 'garage-photos',
  userId: string,
  pathSuffix: string
): Promise<PickAndUploadResult> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return { error: 'Necesitamos permiso para acceder a tus fotos.' };
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    quality: 0.6,
    base64: true,
  });

  if (result.canceled || !result.assets[0]?.base64) {
    return { canceled: true };
  }

  const asset = result.assets[0];
  const base64 = asset.base64!;
  const extension = asset.mimeType?.includes('png') ? 'png' : 'jpg';
  const path = `${userId}/${pathSuffix}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, decode(base64), {
      contentType: asset.mimeType ?? 'image/jpeg',
      upsert: true,
    });

  if (uploadError) return { error: uploadError.message };

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: `${data.publicUrl}?t=${Date.now()}` };
}
