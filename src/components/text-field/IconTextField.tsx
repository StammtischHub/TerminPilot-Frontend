import { TextField, InputAdornment, type TextFieldProps } from '@mui/material';
import type { ReactNode } from 'react';

type IconTextFieldProps = TextFieldProps & {
  icon: ReactNode;
};

export default function IconTextField({ icon, slotProps, ...props }: IconTextFieldProps) {
  return (
    <TextField
      variant="filled"
      size="medium"
      sx={{
        width: '80%',
      }}
      slotProps={{
        ...slotProps,
        input: {
          startAdornment: <InputAdornment position="start">{icon}</InputAdornment>,
          ...slotProps?.input,
        },
      }}
      {...props}
    />
  );
}
