import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import StudentHome from './pages/StudentHome';

type Page = 'login' | 'student';

export default function App() {
  const [page, setPage] = useState<Page>('login');

  if (page === 'student') {
    return <StudentHome onBack={() => setPage('login')} />;
  }

  return <LoginPage onStudentSelect={() => setPage('student')} />;
}
