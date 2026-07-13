import { Routes, Route, Navigate } from 'react-router';
import LoginPage from './pages/LoginPage.tsx';
import HomePage from './pages/HomePage.tsx';
import { TerminFormularLayout } from './pages/TerminFormular/TerminFormularLayout.tsx';
import { UserSelection } from './pages/TerminFormular/steps/UserSelection.tsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="termin" element={<TerminFormularLayout />}>
        <Route index element={<Navigate to="user-selection" replace />} />
        <Route path="user-selection" element={<UserSelection />} />
      </Route>
    </Routes>
  );
}
