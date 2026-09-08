import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, it, expect, vi } from 'vitest';
import App from './App';
import { AuthContext } from './auth/AuthContext';
import type {Schema} from "./api/types.ts";

type User = Schema<'UserResponse'>;

function renderWithAuth(user: User | null = null) {
  return render(
    <AuthContext.Provider
      value={{ user, isLoading: false, login: vi.fn(), register: vi.fn(), logout: vi.fn() }}
    >
      <MemoryRouter>
        <App />
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('App', () => {
  it('renders without errors (unauthenticated)', () => {
    expect(() => renderWithAuth(null)).not.toThrow();
  });

  it('renders without errors (authenticated)', () => {
    expect(() => renderWithAuth({ id: 1, username: 'max', roles: ['user'] })).not.toThrow();
  });
});
