import { TextField, InputAdornment, type TextFieldProps } from '@mui/material';
import type { ReactNode } from 'react';

type TextFieldWithIconProps = TextFieldProps & {
  icon: ReactNode;
};

export default function TextFieldWithIcon({ icon, slotProps, ...props }: TextFieldWithIconProps) {
  return (
    <TextField
      variant="filled"
      fullWidth
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
