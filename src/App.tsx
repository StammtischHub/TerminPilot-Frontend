import { Routes, Route, Navigate } from 'react-router';
import Home from './pages/Home.tsx';
import Login from './pages/Login.tsx';
import { RequireAuth } from './auth/RequireAuth.tsx';
import Register from './pages/Register.tsx';
import CreateGroup from './pages/CreateGroup.tsx';
import AccountSettings from './pages/AccountSettings.tsx';
import {TerminFormularLayout} from "./pages/TerminFormular/TerminFormularLayout.tsx";
import {UserSelection} from "./pages/TerminFormular/steps/UserSelection.tsx";
import {Constraints} from "./pages/TerminFormular/steps/Constraints.tsx";
import {EventSuggestions} from "./pages/TerminFormular/steps/EventSuggestions.tsx";
import {EventData} from "./pages/TerminFormular/steps/EventData.tsx";
import {Overview} from "./pages/TerminFormular/steps/Overview.tsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<RequireAuth />}>
        <Route path="/home" element={<Home />} />
        <Route path="/create-group" element={<CreateGroup />} />
        <Route path="/account-settings" element={<AccountSettings />} />
        <Route path="event" element={<TerminFormularLayout />}>
          <Route index element={<Navigate to="user-selection" replace />} />
          <Route path="user-selection" element={<UserSelection />} />
          <Route path="constraints" element={<Constraints />} />
          <Route path="event-suggestions" element={<EventSuggestions />} />
          <Route path="event-data" element={<EventData />} />
          <Route path="overview" element={<Overview />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
