import { useEffect, useState } from 'react';
import LoginPage from './pages/LoginPage';
import StudentHome from './pages/StudentHome';
import ReadingDetectivePage from './pages/ReadingDetectivePage';
import ReasoningChallengePage from './pages/ReasoningChallengePage';
import AIArgumentationPage from './pages/AIArgumentationPage';
import AINotesPage from './pages/AINotesPage';
import ReflectionPage, { INITIAL_REFLECTION_MESSAGE } from './pages/ReflectionPage';
import ReviewReasoningPage from './pages/ReviewReasoningPage';
import type { Note, Stance } from './components/activity/NotesPanel';
import { type Message, INITIAL_CHAT_MESSAGE } from './components/activity/AIChatPanel';
import { useAuth } from './contexts/AuthContext';
import { api } from './lib/api';

type Page = 'login' | 'student' | 'reading' | 'reasoning' | 'argumentation' | 'ainotes' | 'reflection' | 'review';

export default function App() {
  const { user, loading, logout } = useAuth();
  const [page, setPage]                     = useState<Page>('login');
  const [notes, setNotes]                   = useState<Note[]>([]);
  const [currentScenarioId, setScenarioId]  = useState<number | null>(null);
  const [chatMessages, setChatMessages]           = useState<Message[]>([INITIAL_CHAT_MESSAGE]);
  const [reflectionMessages, setReflectionMessages] = useState<Message[]>([INITIAL_REFLECTION_MESSAGE]);

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

  // Init AI chat when entering argumentation page (stores opening message in DB on first visit)
  useEffect(() => {
    if (page !== 'argumentation' || !currentScenarioId) return;
    api.initAiChat(currentScenarioId)
      .then(({ messages }) => { if (messages.length > 0) setChatMessages(messages); })
      .catch(console.error);
  }, [page, currentScenarioId]);

  // Init reflection chat when entering reflection page
  useEffect(() => {
    if (page !== 'reflection' || !currentScenarioId) return;
    api.initAiReflection(currentScenarioId)
      .then(({ messages }) => { if (messages.length > 0) setReflectionMessages(messages); })
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

  if (page === 'review') {
    return (
      <ReviewReasoningPage
        notes={notes}
        onAdd={addNote}
        onEdit={editNote}
        onDelete={deleteNote}
        scenarioId={currentScenarioId ?? 1}
        onBack={() => setPage('reflection')}
        onLogout={handleLogout}
      />
    );
  }

  if (page === 'reflection') {
    return (
      <ReflectionPage
        notes={notes}
        onAdd={addNote}
        onEdit={editNote}
        onDelete={deleteNote}
        scenarioId={currentScenarioId ?? 1}
        messages={reflectionMessages}
        onMessagesChange={setReflectionMessages}
        onBack={() => setPage('ainotes')}
        onNextStage={() => setPage('review')}
        onLogout={handleLogout}
      />
    );
  }

  if (page === 'ainotes') {
    return (
      <AINotesPage
        notes={notes}
        onAdd={addNote}
        onEdit={editNote}
        onDelete={deleteNote}
        scenarioId={currentScenarioId ?? 1}
        chatMessages={chatMessages}
        onBack={() => setPage('argumentation')}
        onNextStage={() => setPage('reflection')}
        onLogout={handleLogout}
      />
    );
  }

  if (page === 'argumentation') {
    return (
      <AIArgumentationPage
        notes={notes}
        scenarioId={currentScenarioId ?? 1}
        messages={chatMessages}
        onMessagesChange={setChatMessages}
        onBack={() => setPage('reasoning')}
        onNextStage={() => setPage('ainotes')}
        onLogout={handleLogout}
      />
    );
  }

  if (page === 'reasoning') {
    return (
      <ReasoningChallengePage
        notes={notes}
        scenarioId={currentScenarioId ?? 1}
        onBack={() => setPage('reading')}
        onNextStage={() => setPage('argumentation')}
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
