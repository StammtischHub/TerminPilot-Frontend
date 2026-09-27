import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, it, expect, vi } from 'vitest';
import App from './App';
import { AuthContext } from './auth/AuthContext';
import type { Schema } from './api/types.ts';

type User = Schema<'UserResponse'>;

vi.mock('./api/client', () => ({
  api: {
    GET: vi.fn().mockResolvedValue({ data: [] }),
    POST: vi.fn().mockResolvedValue({ data: undefined }),
    PUT: vi.fn().mockResolvedValue({ data: undefined }),
    DELETE: vi.fn().mockResolvedValue({ data: undefined }),
  },
}));

function renderWithAuth(user: User | null = null) {
  return render(
    <AuthContext.Provider
      value={{
        user,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        updateUser: vi.fn(),
      }}
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

  it('renders the home page (authenticated)', async () => {
    renderWithAuth({ id: 1, username: 'max', roles: ['user'] });
    expect(await screen.findByText('Du bist noch in keiner Gruppe.')).toBeInTheDocument();
  });
});
