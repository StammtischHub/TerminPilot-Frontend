import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';
import { MemoryRouter } from 'react-router';

describe('App', () => {
  it('rendert ohne Fehler', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
    expect(document.body).toBeInTheDocument();
  });
});
