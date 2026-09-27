import { useState } from 'react';
import { Alert, Snackbar } from '@mui/material';

export type Feedback = {
  severity: 'success' | 'info' | 'warning' | 'error';
  message: string;
};

type FeedbackSnackbarProps = {
  feedback: Feedback | null;
  onClose: () => void;
  autoHideDuration?: number;
};

export default function FeedbackSnackbar({
  feedback,
  onClose,
  autoHideDuration = 4000,
}: FeedbackSnackbarProps) {
  const [displayed, setDisplayed] = useState<Feedback | null>(feedback);
  if (feedback !== null && feedback !== displayed) {
    setDisplayed(feedback);
  }

  return (
    <Snackbar
      open={feedback !== null}
      autoHideDuration={autoHideDuration}
      onClose={(_, reason) => {
        if (reason !== 'clickaway') onClose();
      }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        severity={displayed?.severity ?? 'success'}
        variant="filled"
        onClose={onClose}
        sx={{ width: '100%' }}
      >
        {displayed?.message}
      </Alert>
    </Snackbar>
  );
}
