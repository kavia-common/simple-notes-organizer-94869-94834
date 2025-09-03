import { supabase } from '../utils/supabase';

// PUBLIC_INTERFACE
export const listNotes = async (search) => {
  /** Lists notes for current user ordered by updated_at desc; supports case-insensitive search on title */
  const { data: { user } } = await supabase.auth.getUser();
  let query = supabase.from('notes').select('*').order('updated_at', { ascending: false });
  if (user?.id) query = query.eq('user_id', user.id);
  if (search) {
    query = query.ilike('title', `%${search}%`);
  }
  const { data, error } = await query;
  return { data, error };
};

// PUBLIC_INTERFACE
export const createNote = async ({ title, content, tags }) => {
  /** Creates a note for the current user */
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

// PUBLIC_INTERFACE
export const updateNote = async (id, patch) => {
  /** Updates a note by id; relies on RLS to restrict by owner */
  const { data, error } = await supabase.from('notes')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

// PUBLIC_INTERFACE
export const deleteNote = async (id) => {
  /** Deletes a note by id; relies on RLS to restrict by owner */
  const { data, error } = await supabase.from('notes').delete().eq('id', id).select().single();
  return { data, error };
};
