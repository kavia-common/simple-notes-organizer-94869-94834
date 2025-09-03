import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './utils/supabase';
import { listNotes, createNote as apiCreateNote, updateNote as apiUpdateNote, deleteNote as apiDeleteNote } from './services/notesService';
import AuthCallback from './components/AuthCallback';
import AuthError from './components/AuthError';
import './theme.css';

// Helpers
const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString();
};

// PUBLIC_INTERFACE
export function RequireAuth({ children }) {
  /** Protects routes by redirecting to /signin if user not authenticated */
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setAuthed(!!data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session);
    });
    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  if (!ready) return <div className="empty">Loading...</div>;
  if (!authed) return <Navigate to="/signin" state={{ from: location }} replace />;
  return children;
}

function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const signInEmailPass = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data?.user) navigate('/');
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const oauth = async (provider) => {
    setBusy(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin + '/auth/callback' }
    });
    setBusy(false);
    if (error) setError(error.message);
  };

  return (
    <div className="app" style={{ alignItems: 'stretch' }}>
      <div className="main" style={{ width: '100%' }}>
        <div className="header">
          <div className="brand">
            <div className="brand-badge" />
            Simple Notes
          </div>
          <div className="authbar">
            <button className="btn btn-secondary" onClick={signOut}>Sign out</button>
          </div>
        </div>
        <div className="editor" style={{ maxWidth: 560, margin: '40px auto' }}>
          <h2>Welcome back</h2>
          <form onSubmit={signInEmailPass} className="editor" style={{ gap: 10 }}>
            <input className="input" type="email" placeholder="Email address" value={email} onChange={(e)=>setEmail(e.target.value)} required />
            <input className="input" type="password" placeholder="Password" value={pass} onChange={(e)=>setPass(e.target.value)} required />
            {error ? <div className="badge" style={{ color: '#b00020', borderColor: '#ffd1d1', background: '#fff7f7' }}>Error: {error}</div> : null}
            <div className="toolbar">
              <button className="btn" type="submit" disabled={busy}>{busy ? 'Signing in...' : 'Sign In'}</button>
              <button type="button" className="btn btn-secondary" onClick={()=>oauth('github')}>Sign in with GitHub</button>
            </div>
          </form>
          <div className="empty">No account? Use Supabase Auth to sign up and then sign in.</div>
        </div>
      </div>
    </div>
  );
}

function useAuthUser() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub?.subscription?.unsubscribe?.();
  }, []);
  return user;
}

function NotesLayout() {
  const navigate = useNavigate();
  const user = useAuthUser();

  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const activeNote = useMemo(
    () => notes.find((n) => n.id === activeId) || null,
    [notes, activeId]
  );

  const fetchNotes = useCallback(async (q) => {
    setLoading(true);
    const { data, error } = await listNotes(q);
    setLoading(false);
    if (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      return;
    }
    setNotes(data || []);
    if (!activeId && (data?.length ?? 0) > 0) {
      setActiveId(data[0].id);
    }
  }, [activeId]);

  useEffect(() => {
    fetchNotes('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = async (e) => {
    const value = e.target.value;
    setSearch(value);
    await fetchNotes(value);
  };

  const onSelect = (id) => {
    setActiveId(id);
  };

  const onCreate = async () => {
    setSaving(true);
    const { data, error } = await apiCreateNote({
      title: 'Untitled note',
      content: '',
      tags: null
    });
    setSaving(false);
    if (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      return;
    }
    setNotes((prev) => [data, ...prev]);
    setActiveId(data.id);
  };

  const onDelete = async (id) => {
    if (!id) return;
    if (!window.confirm('Delete this note?')) return;
    const { error } = await apiDeleteNote(id);
    if (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      return;
    }
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setActiveId((prev) => {
      if (prev === id) {
        const first = notes.find((n) => n.id !== id);
        return first?.id || null;
      }
      return prev;
    });
  };

  const onUpdate = async (patch) => {
    if (!activeNote) return;
    const id = activeNote.id;
    const next = { ...activeNote, ...patch, updated_at: new Date().toISOString() };
    // optimistic UI
    setNotes((prev) => prev.map((n) => (n.id === id ? next : n)));
    setSaving(true);
    const { data, error } = await apiUpdateNote(id, patch);
    setSaving(false);
    if (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      // revert if failed
      await fetchNotes(search);
      return;
    }
    setNotes((prev) => prev.map((n) => (n.id === id ? data : n)));
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/signin');
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="header">
          <div className="brand">
            <div className="brand-badge" />
            Simple Notes
          </div>
          <div className="authbar">
            <div className="avatar" title={user?.email || 'User'} />
          </div>
        </div>
        <div className="sidebar-header">
          <input className="search" placeholder="Search notes" value={search} onChange={onSearch} />
          <button className="btn" onClick={onCreate} disabled={saving}>{saving ? '...' : 'New'}</button>
        </div>
        <div className="notes-list">
          {loading ? (
            <div className="empty">Loading notes...</div>
          ) : notes.length === 0 ? (
            <div className="empty">No notes yet. Create one!</div>
          ) : (
            notes.map((n) => (
              <div
                key={n.id}
                className={'note-item' + (n.id === activeId ? ' active' : '')}
                onClick={() => onSelect(n.id)}
              >
                <div className="note-title">{n.title || 'Untitled'}</div>
                <div className="note-date">Updated {formatDate(n.updated_at)}</div>
              </div>
            ))
          )}
        </div>
      </aside>

      <main className="main">
        <div className="main-header">
          <div className="badge">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-accent)', display: 'inline-block' }} />
            {saving ? 'Saving...' : 'Synced'}
          </div>
          <div className="grow" />
          <button className="btn btn-secondary" onClick={() => onDelete(activeId)} disabled={!activeId}>Delete</button>
          <button className="btn" onClick={signOut}>Sign out</button>
        </div>
        <div className="editor">
          {!activeNote ? (
            <div className="empty">Select a note from the sidebar or create a new one.</div>
          ) : (
            <>
              <input
                className="input title-input"
                value={activeNote.title || ''}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Note title"
              />
              <textarea
                className="input textarea"
                value={activeNote.content || ''}
                onChange={(e) => onUpdate({ content: e.target.value })}
                placeholder="Write your note..."
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// PUBLIC_INTERFACE
export default function NotesAppRouter() {
  /** Top-level router for the Notes application, including auth callback and protected routes */
  const navigate = useNavigate();
  return (
    <Routes>
      <Route path="/auth/callback" element={<AuthCallback navigate={navigate} />} />
      <Route path="/auth/error" element={<AuthError />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/*" element={
        <RequireAuth>
          <NotesLayout />
        </RequireAuth>
      } />
    </Routes>
  );
}
