import { Routes, Route, Navigate } from 'react-router';
import LoginPage from './pages/LoginPage.tsx';
import HomePage from './pages/HomePage.tsx';
import { TerminFormularLayout } from './pages/TerminFormular/TerminFormularLayout.tsx';
import { UserSelection } from './pages/TerminFormular/steps/UserSelection.tsx';
import { RequireAuth } from './auth/RequireAuth.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import { Conditions } from './pages/TerminFormular/steps/Conditions.tsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<RequireAuth />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="event" element={<TerminFormularLayout />}>
          <Route index element={<Navigate to="user-selection" replace />} />
          <Route path="user-selection" element={<UserSelection />} />
          <Route path="conditions" element={<Conditions />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
