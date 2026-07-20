import type { TextFieldProps } from '@mui/material';
import { PersonOutlined } from '@mui/icons-material';
import TextFieldWithIcon from './TextFieldWithIcon.tsx';

type UsernameTextFieldProps = TextFieldProps;

export default function UsernameTextField({ ...props }: UsernameTextFieldProps) {
  return (
    <TextFieldWithIcon
      id="username-input"
      label="Benutzername"
      icon={<PersonOutlined fontSize="small" />}
      placeholder="Benutzername"
      autoComplete="username"
      required
      {...props}
    />
  );
}
