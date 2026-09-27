import { useCallback, useState } from 'react';

const UNKNOWN_ERROR = 'Unbekannter Fehler. Bitte versuche es erneut.';
const NETWORK_ERROR = 'Das System kann nicht erreicht werden. Bitte versuche es später erneut.';

type SubmitOptions = {
  /** Fehlermeldungen je HTTP-Status, z. B. {409: 'Name vergeben' } */
  errorMessages?: Partial<Record<number, string>>;
  onSuccess?: (response: Response) => void | Promise<void>;
};

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
      } catch {
        setError(NETWORK_ERROR);
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  return { submit, isSubmitting, error, setError };
}
