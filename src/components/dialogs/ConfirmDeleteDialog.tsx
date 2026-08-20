import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

type ConfirmDeleteDialogProps = {
  open: boolean;
  groupName: string;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmDeleteDialog({
  open,
  groupName,
  isDeleting,
  onCancel,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={isDeleting ? undefined : onCancel}
      maxWidth="xs"
      fullWidth
      aria-labelledby="confirm-delete-title"
    >
      <DialogTitle id="confirm-delete-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningAmberIcon color="error" />
        Gruppe löschen?
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Möchtest du die Gruppe <strong>„{groupName}"</strong> wirklich löschen? Diese Aktion kann
          nicht rückgängig gemacht werden.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} disabled={isDeleting}>
          Abbrechen
        </Button>
        <Button variant="contained" color="error" onClick={onConfirm} disabled={isDeleting}>
          {isDeleting ? 'Wird gelöscht …' : 'Endgültig löschen'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
