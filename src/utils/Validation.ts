const USERNAME_PATTERN = /^[a-zA-Z0-9._-]+$/;

export function validateUsername(username: string): string | undefined {
  if (username.length < 3) return 'Der Benutzername muss mindestens 3 Zeichen lang sein.';
  if (username.length > 50) return 'Der Benutzername darf maximal 50 Zeichen lang sein.';
  if (!USERNAME_PATTERN.test(username)) return 'Erlaubt sind Buchstaben, Zahlen sowie . _ -';
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (password.length < 12) return 'Das Passwort muss mindestens 12 Zeichen lang sein.';
  if (password.length > 72) return 'Das Passwort darf maximal 72 Zeichen lang sein.';
  return undefined;
}

export function validatePasswordConfirmation(
  password: string,
  passwordConfirmation: string,
): string | undefined {
  if (passwordConfirmation !== password) return 'Die Passwörter stimmen nicht überein.';
  return undefined;
}
