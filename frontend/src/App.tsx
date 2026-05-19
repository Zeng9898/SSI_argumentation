import { useEffect, useState } from 'react';
import LoginPage from './pages/LoginPage';
import StudentHome from './pages/StudentHome';
import ReadingDetectivePage from './pages/ReadingDetectivePage';
import ReasoningChallengePage from './pages/ReasoningChallengePage';
import type { Note, Stance } from './components/activity/NotesPanel';
import { useAuth } from './contexts/AuthContext';

type Page = 'login' | 'student' | 'reading' | 'reasoning';

export default function App() {
  const { user, loading, logout } = useAuth();
  const [page, setPage]           = useState<Page>('login');
  const [notes, setNotes]         = useState<Note[]>([]);

  // Restore session: if token exists and user is fetched, skip login page
  useEffect(() => {
    if (!loading && user) setPage('student');
  }, [loading, user]);

  const addNote = (data: { stance: Stance; content: string }) =>
    setNotes((prev) => [
      ...prev,
      { ...data, id: Date.now().toString(), createdAt: new Date().toLocaleDateString('zh-TW') },
    ]);

  const editNote = (id: string, data: { stance: Stance; content: string }) =>
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...data } : n)));

  const deleteNote = (id: string) =>
    setNotes((prev) => prev.filter((n) => n.id !== id));

  const handleLogout = () => {
    logout();
    setNotes([]);
    setPage('login');
  };

  if (loading) return null;

  if (page === 'reasoning') {
    return (
      <ReasoningChallengePage
        notes={notes}
        onBack={() => setPage('reading')}
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
      />
    );
  }

  if (page === 'student') {
    return <StudentHome onBack={handleLogout} onStartActivity={() => setPage('reading')} />;
  }

  return <LoginPage onLoginSuccess={() => setPage('student')} />;
}
