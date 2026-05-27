import { useEffect, useRef, useState } from 'react';
import LoginPage from './pages/LoginPage';
import StudentHome from './pages/StudentHome';
import TeacherDashboard from './pages/TeacherDashboard';
import ReadingDetectivePage from './pages/ReadingDetectivePage';
import ReasoningChallengePage from './pages/ReasoningChallengePage';
import AIArgumentationPage from './pages/AIArgumentationPage';
import AINotesPage from './pages/AINotesPage';
import ReflectionPage, { INITIAL_REFLECTION_MESSAGE } from './pages/ReflectionPage';
import ReviewReasoningPage from './pages/ReviewReasoningPage';
import type { Note, Stance } from './components/activity/NotesPanel';
import { type Message, INITIAL_CHAT_MESSAGE } from './components/activity/AIChatPanel';
import { useAuth } from './contexts/AuthContext';
import { api, type Phase, type StudentSettings } from './lib/api';
import { isScenarioLocked } from './lib/scenarioContent';

type Page = 'login' | 'student' | 'reading' | 'reasoning' | 'argumentation' | 'ainotes' | 'reflection' | 'review';

const PHASE_ORDER: Phase[] = [
  'reading', 'reasoning', 'argumentation', 'ainotes', 'reflection', 'review', 'completed',
];

export default function App() {
  const { user, loading, logout } = useAuth();
  const [page, setPage]                     = useState<Page>('login');
  const [notes, setNotes]                   = useState<Note[]>([]);
  const [currentScenarioId, setScenarioId]  = useState<number | null>(null);
  const [chatMessages, setChatMessages]           = useState<Message[]>([INITIAL_CHAT_MESSAGE]);
  const [reflectionMessages, setReflectionMessages] = useState<Message[]>([INITIAL_REFLECTION_MESSAGE]);
  const [studentSettings, setStudentSettings] = useState<StudentSettings | null>(null);
  const [phaseBlockMsg, setPhaseBlockMsg]     = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!loading && user) {
      setPage(user.role === 'teacher' ? 'student' : 'student');
    }
  }, [loading, user]);

  // Poll student settings every 30s once scenario is active
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (!currentScenarioId || user?.role !== 'student') return;

    const fetch = () => {
      api.studentSettings(currentScenarioId).then(setStudentSettings).catch(console.error);
    };
    fetch();
    pollRef.current = setInterval(fetch, 30_000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [currentScenarioId, user?.role]);

  // Load notes when entering reading page
  useEffect(() => {
    if (page !== 'reading' || !currentScenarioId) return;
    api.notes(currentScenarioId)
      .then(({ notes: loaded }) => setNotes(loaded as Note[]))
      .catch(console.error);
  }, [page, currentScenarioId]);

  // Init AI chat when entering argumentation page
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

  // ── Phase guard ──────────────────────────────────────────
  const canNavigateTo = (phase: Phase): boolean => {
    if (!studentSettings) return true; // fail open if not loaded
    const allowed = PHASE_ORDER.indexOf(studentSettings.allowed_phase);
    const target  = PHASE_ORDER.indexOf(phase);
    return target <= allowed;
  };

  const guardedNext = (targetPage: Page, targetPhase: Phase) => () => {
    if (!canNavigateTo(targetPhase)) {
      setPhaseBlockMsg('請等待老師開放此階段');
      setTimeout(() => setPhaseBlockMsg(null), 3000);
      return;
    }
    setPage(targetPage);
  };

  // ── Notes helpers ────────────────────────────────────────
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
    setStudentSettings(null);
    setPage('login');
  };

  if (loading) return null;

  // ── Teacher view ─────────────────────────────────────────
  if (user?.role === 'teacher') {
    return <TeacherDashboard onLogout={handleLogout} />;
  }

  // ── Phase block toast ────────────────────────────────────
  const PhaseToast = phaseBlockMsg ? (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50
                    bg-[#5A3E22] text-white font-game text-sm font-bold
                    px-5 py-3 rounded-2xl shadow-lg animate-fade-up">
      🔒 {phaseBlockMsg}
    </div>
  ) : null;

  // ── Student pages ────────────────────────────────────────
  const scenarioId = currentScenarioId ?? 1;
  const canEditReasoning = studentSettings?.can_edit_reasoning ?? true;
  const isLocked = isScenarioLocked(scenarioId);

  if (page === 'review') return (
    <>
      {PhaseToast}
      <ReviewReasoningPage
        notes={notes} onAdd={addNote} onEdit={editNote} onDelete={deleteNote}
        scenarioId={scenarioId} onBack={() => setPage('reflection')} onLogout={handleLogout}
        readOnly={isLocked}
      />
    </>
  );

  if (page === 'reflection') return (
    <>
      {PhaseToast}
      <ReflectionPage
        notes={notes} onAdd={addNote} onEdit={editNote} onDelete={deleteNote}
        scenarioId={scenarioId}
        messages={reflectionMessages} onMessagesChange={setReflectionMessages}
        onBack={() => setPage('ainotes')}
        onNextStage={guardedNext('review', 'review')}
        onLogout={handleLogout}
        readOnly={isLocked}
      />
    </>
  );

  if (page === 'ainotes') return (
    <>
      {PhaseToast}
      <AINotesPage
        notes={notes} onAdd={addNote} onEdit={editNote} onDelete={deleteNote}
        scenarioId={scenarioId} chatMessages={chatMessages}
        onBack={() => setPage('argumentation')}
        onNextStage={guardedNext('reflection', 'reflection')}
        onLogout={handleLogout}
        readOnly={isLocked}
      />
    </>
  );

  if (page === 'argumentation') return (
    <>
      {PhaseToast}
      <AIArgumentationPage
        notes={notes} scenarioId={scenarioId}
        messages={chatMessages} onMessagesChange={setChatMessages}
        onBack={() => setPage('reasoning')}
        onNextStage={guardedNext('ainotes', 'ainotes')}
        onLogout={handleLogout}
        readOnly={isLocked}
      />
    </>
  );

  if (page === 'reasoning') return (
    <>
      {PhaseToast}
      <ReasoningChallengePage
        notes={notes} scenarioId={scenarioId}
        canEditReasoning={canEditReasoning}
        readOnly={isLocked}
        onBack={() => setPage('reading')}
        onNextStage={guardedNext('argumentation', 'argumentation')}
        onLogout={handleLogout}
      />
    </>
  );

  if (page === 'reading') return (
    <>
      {PhaseToast}
      <ReadingDetectivePage
        notes={notes} onAdd={addNote} onEdit={editNote} onDelete={deleteNote}
        scenarioId={scenarioId}
        readOnly={isLocked}
        onBack={() => setPage('student')}
        onNextStage={guardedNext('reasoning', 'reasoning')}
        onLogout={handleLogout}
      />
    </>
  );

  if (page === 'student') return (
    <StudentHome onBack={handleLogout} onStartActivity={handleStartActivity} />
  );

  return <LoginPage onLoginSuccess={() => setPage('student')} />;
}
