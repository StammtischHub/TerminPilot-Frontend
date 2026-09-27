import { Routes, Route, Navigate } from 'react-router';
import Home from './pages/Home.tsx';
import Login from './pages/Login.tsx';
import { RequireAuth } from './auth/RequireAuth.tsx';
import Register from './pages/Register.tsx';
import CreateGroup from './pages/CreateGroup.tsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<RequireAuth />}>
        <Route path="/home" element={<Home />} />
        <Route path="/create-group" element={<CreateGroup />} />
      </Route>
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
