import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import type { GarageComment, GarageProject, ProgressEntry } from '@/types/database';

export function useGarage() {
  const { session, refreshProfile } = useAuth();
  const userId = session?.user.id;

  const [project, setProject] = useState<GarageProject | null>(null);
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [comments, setComments] = useState<GarageComment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    const [{ data: projectData }, { data: commentsData }] = await Promise.all([
      supabase.from('garage_projects').select('*').eq('user_id', userId).maybeSingle(),
      supabase
        .from('garage_comments')
        .select('*')
        .eq('garage_owner_id', userId)
        .order('created_at', { ascending: true }),
    ]);

    setProject(projectData ?? null);
    setComments(commentsData ?? []);

    if (projectData) {
      const { data: progressData } = await supabase
        .from('progress_entries')
        .select('*')
        .eq('garage_project_id', projectData.id)
        .order('created_at', { ascending: false });
      setProgress(progressData ?? []);
    } else {
      setProgress([]);
    }

    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveProject(input: { nombre: string; specs: string; color: string; photoUrl: string | null }) {
    if (!userId) return { error: 'No autenticado' };
    const { data, error } = await supabase
      .from('garage_projects')
      .upsert(
        {
          user_id: userId,
          nombre: input.nombre,
          specs: input.specs,
          color: input.color,
          photo_url: input.photoUrl,
        },
        { onConflict: 'user_id' }
      )
      .select('*')
      .single();

    if (error) return { error: error.message };
    setProject(data);
    return { error: null };
  }

  async function addProgress(input: { tipo: string; texto: string; photoUrl: string }) {
    if (!userId || !project) return { error: 'Primero crea tu proyecto de garaje' };
    const { data, error } = await supabase
      .from('progress_entries')
      .insert({
        garage_project_id: project.id,
        user_id: userId,
        tipo: input.tipo,
        texto: input.texto,
        photo_url: input.photoUrl,
      })
      .select('*')
      .single();

    if (error) return { error: error.message };
    setProgress((prev) => [data, ...prev]);
    await refreshProfile();
    return { error: null, pointsAwarded: data.points_awarded };
  }

  async function addOwnComment(text: string) {
    if (!userId) return { error: 'No autenticado' };
    const { data, error } = await supabase
      .from('garage_comments')
      .insert({ garage_owner_id: userId, author_id: userId, text })
      .select('*')
      .single();

    if (error) return { error: error.message };
    setComments((prev) => [...prev, data]);
    return { error: null };
  }

  return { project, progress, comments, loading, saveProject, addProgress, addOwnComment, refresh: load };
}
