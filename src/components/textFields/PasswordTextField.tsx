import { LockOpenOutlined, LockOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import { IconButton, InputAdornment, type TextFieldProps } from '@mui/material';
import TextFieldWithIcon from './TextFieldWithIcon.tsx';
import { type ReactNode, useState } from 'react';

type PasswordTextFieldProps = TextFieldProps;

export default function PasswordTextField({ ...props }: PasswordTextFieldProps): ReactNode {
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <TextFieldWithIcon
      id="password-input"
      label="Passwort"
      icon={
        passwordFocus ? <LockOpenOutlined fontSize="small" /> : <LockOutlined fontSize="small" />
      }
      placeholder="Passwort"
      type={showPassword ? 'text' : 'password'}
      autoComplete="current-password"
      required
      onFocus={() => setPasswordFocus(true)}
      onBlur={() => setPasswordFocus(false)}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword((s) => !s)}
                edge="end"
                size="small"
                aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
              >
                {showPassword ? (
                  <Visibility fontSize="small" />
                ) : (
                  <VisibilityOff fontSize="small" />
                )}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
      {...props}
    />
  );
}
