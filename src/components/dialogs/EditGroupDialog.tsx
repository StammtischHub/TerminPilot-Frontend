import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Skeleton,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import GroupIcon from '@mui/icons-material/Group';
import SaveIcon from '@mui/icons-material/Save';
import { api } from '../../api/client.ts';
import type { Schema } from '../../api/types.ts';
import { useAuthedUser } from '../../auth/useAuthedUser.ts';
import ConfirmDeleteDialog from './ConfirmDeleteDialog.tsx';
import {DeleteOutlined} from "@mui/icons-material";
import {isMobile} from "../../utils/ThemeHelpers.ts";

type UserResponse = Schema<'UserResponse'>;
type UserGroupResponse = Schema<'UserGroupResponse'>;

type EditGroupDialogProps = {
  open: boolean;
  group: UserGroupResponse | null;
  onClose: () => void;
  onSaved: (updatedGroup: UserGroupResponse) => void;
  onDeleted: (groupId: number) => void;
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

export default function EditGroupDialog({ open, group, onClose, onSaved, onDeleted }: EditGroupDialogProps) {
  const mobile = useMediaQuery(isMobile);
  const authenticatedUser = useAuthedUser();

  const [groupName, setGroupName] = useState(group?.name ?? '');
  const [allUsers, setAllUsers] = useState<UserResponse[]>([]);
  const [isLoadingAllUsers, setIsLoadingAllUsers] = useState(true);
  const [checkedUserIds, setCheckedUserIds] = useState<number[]>(group?.members.map((member) => member.id) ?? []);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log(groupName)
  console.log(checkedUserIds)

  useEffect(() => {
    if (!open) return;
    api
      .GET('/api/users', {})
      .then(({ data }) => setAllUsers(data ?? []))
      .finally(() => setIsLoadingAllUsers(false));
  }, [open]);

  const otherUsers = useMemo(
    () => allUsers.filter((availableUser) => availableUser.id !== authenticatedUser.id),
    [allUsers, authenticatedUser.id],
  );

  const isChecked = (id: number) => checkedUserIds.includes(id);

  const handleToggle = (id: number) => {
    setCheckedUserIds((prev) =>
      prev.includes(id) ? prev.filter((checkedId) => checkedId !== id) : [...prev, id],
    );
  };

  const canSave = groupName.trim().length > 0 && checkedUserIds.length >= 2 && !isSaving;

  const handleSave = () => {
    if (!group) return;
    setIsSaving(true);
    setError(null);
    api
      .PATCH('/api/user-groups/{user-group-id}', {
        params: { path: { 'user-group-id': group.id } },
        body: {
          name: groupName.trim(),
          memberIds: checkedUserIds,
        },
      })
      .then(({ data, error: apiError }) => {
        if (apiError || !data) {
          setError('Die Gruppe konnte nicht gespeichert werden. Bitte versuche es erneut.');
          return;
        }
        onSaved(data);
        onClose();
      })
      .catch(() => setError('Die Gruppe konnte nicht gespeichert werden. Bitte versuche es erneut.'))
      .finally(() => setIsSaving(false));
  };

  const handleDelete = () => {
    if (!group) return;
    setIsDeleting(true);
    setError(null);
    api
      .DELETE('/api/user-groups/{user-group-id}', {
        params: { path: { 'user-group-id': group.id } },
      })
      .then(() => {
        onDeleted(group.id);
        setIsConfirmDeleteOpen(false);
        onClose();
      })
      .catch(() => setError('Die Gruppe konnte nicht gelöscht werden. Bitte versuche es erneut.'))
      .finally(() => setIsDeleting(false));
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={isSaving || isDeleting ? undefined : onClose}
        fullScreen={mobile}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', pr: 6 }}>
          Gruppe bearbeiten
          <IconButton
            aria-label="Schließen"
            onClick={onClose}
            disabled={isSaving || isDeleting}
            sx={{ position: 'absolute', right: 8, top: 8, color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            id="edit-group-name-input"
            label="Gruppenname"
            required
            value={groupName}
            onChange={(event) => setGroupName(event.target.value)}
            variant="outlined"
            fullWidth
            autoFocus
          />

          <Box>
            <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: 'center' }}>
              <GroupIcon color="action" fontSize="small" />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
              >
                Mitglieder
              </Typography>
            </Stack>

            <List
              sx={{
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                maxHeight: 280,
                overflowY: 'auto',
                py: 0,
              }}
            >
              {isLoadingAllUsers ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <ListItem key={index}>
                    <Skeleton variant="circular" width={36} height={36} sx={{ mr: 2 }} />
                    <Skeleton variant="text" width="60%" />
                  </ListItem>
                ))
              ) : (
                <>
                  <ListItem disablePadding secondaryAction={<Checkbox edge="end" checked disabled />}>
                    <ListItemButton disabled>
                      <ListItemAvatar>
                        <Avatar sx={{ width: 36, height: 36, fontSize: 14, bgcolor: 'primary.main' }}>
                          {getInitials(authenticatedUser.username)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={`${authenticatedUser.username} (Du)`} />
                    </ListItemButton>
                  </ListItem>

                  <Divider component="li" />

                  {otherUsers.map((availableUser) => {
                    const checked = isChecked(availableUser.id);
                    const labelId = `edit-group-user-${availableUser.id}`;
                    return (
                      <ListItem
                        key={availableUser.id}
                        disablePadding
                        secondaryAction={
                          <Checkbox
                            edge="end"
                            checked={checked}
                            onChange={() => handleToggle(availableUser.id)}
                            disableRipple
                            slotProps={{ input: { 'aria-labelledby': labelId } }}
                          />
                        }
                      >
                        <ListItemButton onClick={() => handleToggle(availableUser.id)}>
                          <ListItemAvatar>
                            <Avatar sx={{ width: 36, height: 36, fontSize: 14, bgcolor: 'grey.400' }}>
                              {getInitials(availableUser.username)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText id={labelId} primary={availableUser.username} />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </>
              )}
            </List>

            {checkedUserIds.length < 2 && (
              <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                Bitte mindestens zwei Mitglieder auswählen
              </Typography>
            )}
          </Box>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
          <Button
            color="error"
            startIcon={<DeleteOutlined />}
            onClick={() => setIsConfirmDeleteOpen(true)}
            disabled={isSaving || isDeleting}
          >
            Gruppe löschen
          </Button>
          <Stack direction="row" spacing={1}>
            <Button onClick={onClose} disabled={isSaving || isDeleting}>
              Abbrechen
            </Button>
            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={!canSave}>
              {isSaving ? 'Speichert …' : 'Speichern'}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

      <ConfirmDeleteDialog
        open={isConfirmDeleteOpen}
        groupName={group?.name ?? ''}
        isDeleting={isDeleting}
        onCancel={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}
