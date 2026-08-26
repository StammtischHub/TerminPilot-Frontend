import { LockOpenOutlined, LockOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import { IconButton, InputAdornment, type TextFieldProps } from '@mui/material';
import TextFieldWithIcon from './TextFieldWithIcon.tsx';
import { type ReactNode, useState } from 'react';

type PasswordTextFieldProps = TextFieldProps;

export default function PasswordTextField({ ...props }: PasswordTextFieldProps): ReactNode {
  const [inFocus, setInFocus] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <TextFieldWithIcon
      icon={
        inFocus ? <LockOpenOutlined fontSize="small" /> : <LockOutlined fontSize="small" />
      }
      type={showPassword ? 'text' : 'password'}
      onFocus={() => setInFocus(true)}
      onBlur={() => setInFocus(false)}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword((show) => !show)} edge="end" size="small">
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
