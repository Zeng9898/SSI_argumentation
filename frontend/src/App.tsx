import { useEffect, useState } from 'react';
import LoginPage from './pages/LoginPage';
import StudentHome from './pages/StudentHome';
import ReadingDetectivePage from './pages/ReadingDetectivePage';
import ReasoningChallengePage from './pages/ReasoningChallengePage';
import type { Note, Stance } from './components/activity/NotesPanel';
import { useAuth } from './contexts/AuthContext';
import { api } from './lib/api';

type Page = 'login' | 'student' | 'reading' | 'reasoning';

export default function App() {
  const { user, loading, logout } = useAuth();
  const [page, setPage]                     = useState<Page>('login');
  const [notes, setNotes]                   = useState<Note[]>([]);
  const [currentScenarioId, setScenarioId]  = useState<number | null>(null);

  useEffect(() => {
    if (!loading && user) setPage('student');
  }, [loading, user]);

  // Load notes when entering reading page
  useEffect(() => {
    if (page !== 'reading' || !currentScenarioId) return;
    api.notes(currentScenarioId)
      .then(({ notes: loaded }) => setNotes(loaded as Note[]))
      .catch(console.error);
  }, [page, currentScenarioId]);

  const persistNotes = (updated: Note[]) => {
    if (!currentScenarioId) return;
    api.saveNotes(currentScenarioId, updated).catch(console.error);
  };

  const addNote = (data: { stance: Stance; content: string }) => {
    const updated = [
      ...notes,
      { ...data, id: Date.now().toString(), createdAt: new Date().toLocaleDateString('zh-TW') },
    ];
    setNotes(updated);
    persistNotes(updated);
  };

  const editNote = (id: string, data: { stance: Stance; content: string }) => {
    const updated = notes.map((n) => (n.id === id ? { ...n, ...data } : n));
    setNotes(updated);
    persistNotes(updated);
  };

  const deleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    persistNotes(updated);
  };

  const handleStartActivity = (scenarioId: number) => {
    setScenarioId(scenarioId);
    setPage('reading');
  };

  const handleLogout = () => {
    logout();
    setNotes([]);
    setScenarioId(null);
    setPage('login');
  };

  if (loading) return null;

  if (page === 'reasoning') {
    return (
      <ReasoningChallengePage
        notes={notes}
        scenarioId={currentScenarioId ?? 1}
        onBack={() => setPage('reading')}
        onLogout={handleLogout}
      />
    );
  }

  if (page === 'reading') {
    return (
      <ReadingDetectivePage
        notes={notes}
        onAdd={addNote}
        onEdit={editNote}
        onDelete={deleteNote}
        onBack={() => setPage('student')}
        onNextStage={() => setPage('reasoning')}
        onLogout={handleLogout}
      />
    );
  }

  if (page === 'student') {
    return <StudentHome onBack={handleLogout} onStartActivity={handleStartActivity} />;
  }

  return <LoginPage onLoginSuccess={() => setPage('student')} />;
}
