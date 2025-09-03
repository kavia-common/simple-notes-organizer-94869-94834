import { supabase } from '../utils/supabase';

export const listNotes = async (search) => {
  let query = supabase.from('notes').select('*').order('updated_at', { ascending: false });
  if (search) {
    query = query.ilike('title', `%${search}%`);
  }
  const { data, error } = await query;
  return { data, error };
};

export const createNote = async ({ title, content, tags }) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: new Error('Not authenticated') };
  }
  const { data, error } = await supabase.from('notes').insert([{
    user_id: user.id,
    title,
    content,
    tags: tags ?? null
  }]).select().single();
  return { data, error };
};

export const updateNote = async (id, patch) => {
  const { data, error } = await supabase.from('notes')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

export const deleteNote = async (id) => {
  const { data, error } = await supabase.from('notes').delete().eq('id', id).select().single();
  return { data, error };
};
