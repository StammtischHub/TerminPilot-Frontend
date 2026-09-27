import { useCallback, useState } from 'react';

const UNKNOWN_ERROR = 'Unbekannter Fehler. Bitte versuche es erneut.';
const NETWORK_ERROR = 'Das System kann nicht erreicht werden. Bitte versuche es später erneut.';

type SubmitOptions = {
  /** Fehlermeldungen je HTTP-Status, z. B. {409: 'Name vergeben' } */
  errorMessages?: Partial<Record<number, string>>;
  onSuccess?: (response: Response) => void | Promise<void>;
};

/**
 * fetch wirft bei Verbindungsproblemen (Backend aus, CORS, DNS) einen TypeError.
 * Alles andere (z. B. ein Parse-Fehler im eigenen Code) ist kein Netzwerkfehler.
 */
function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError;
}

export function useSafeSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (
      request: () => Promise<Response>,
      { errorMessages = {}, onSuccess }: SubmitOptions = {},
    ) => {
      setError(null);
      setIsSubmitting(true);
      try {
        const response = await request();
        if (response.ok) {
          await onSuccess?.(response);
          return;
        }
        setError(errorMessages[response.status] ?? UNKNOWN_ERROR);
      } catch (caughtError) {
        console.error('Request fehlgeschlagen:', caughtError);
        setError(isNetworkError(caughtError) ? NETWORK_ERROR : UNKNOWN_ERROR);
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  return { submit, isSubmitting, error, setError };
}
