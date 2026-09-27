import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Group, GroupAdd, GroupOff } from '@mui/icons-material';
import { useNavigate } from 'react-router';
import { Blobatar } from '@blobatar/react';
import AppBarsWrapper from '../components/AppBarsWrapper.tsx';
import { generateSeparateStyle } from '../utils/ThemeHelpers.ts';
import { api } from '../api/client.ts';
import type { Schema } from '../api/types.ts';
import { useAuthedUser } from '../auth/useAuthedUser.ts';
import { useSafeSubmit } from '../hooks/useSafeSubmit.ts';

type UserResponse = Schema<'UserResponse'>;

export default function CreateGroupPage() {
  const navigate = useNavigate();
  const user = useAuthedUser();

  const { submit, isSubmitting, error } = useSafeSubmit();

  const [groupName, setGroupName] = useState('');
  const [allUsers, setAllUsers] = useState<UserResponse[]>([]);
  const [isLoadingAllUsers, setIsLoadingAllUsers] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [checkedMemberIds, setCheckedMemberIds] = useState<number[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    api
      .GET('/api/users', { signal: controller.signal })
      .then(({ data, error: responseError }) => {
        if (responseError) {
          setLoadFailed(true);
          return;
        }
        setAllUsers(data ?? []);
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoadFailed(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingAllUsers(false);
      });

    return () => controller.abort();
  }, []);

  const otherUsers = useMemo(
    () => allUsers.filter((availableUser) => availableUser.id !== user.id),
    [allUsers, user.id],
  );

  const trimmedGroupName = groupName.trim();
  const canProceed = checkedMemberIds.length >= 1 && trimmedGroupName.length > 0;

  const handleToggle = (userId: number) => () =>
    setCheckedMemberIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );

  const handleSubmit = () =>
    submit(
      async () =>
        (
          await api.POST('/api/user-groups', {
            body: {
              name: trimmedGroupName,
              creatorId: user.id,
              memberIds: checkedMemberIds,
            },
          })
        ).response,
      {
        errorMessages: { 409: 'Gruppenname wird bereits verwendet' },
        onSuccess: () => navigate('/home'),
      },
    );

  const renderUserItem = (listUser: UserResponse, isCreator = false) => {
    const labelId = `checkbox-list-label-${listUser.id}`;
    const checked = isCreator || checkedMemberIds.includes(listUser.id);
    const onToggle = isCreator ? undefined : handleToggle(listUser.id);

    return (
      <ListItem
        key={listUser.id}
        disablePadding
        secondaryAction={
          <Checkbox
            edge="end"
            checked={checked}
            disabled={isCreator}
            onChange={onToggle}
            disableRipple
            slotProps={{ input: { 'aria-labelledby': labelId } }}
          />
        }
      >
        <ListItemButton onClick={onToggle} disabled={isCreator}>
          <Box sx={{ mr: 2, height: 32, filter: 'drop-shadow(0 0 0.2em black)' }}>
            <Blobatar name={listUser.username} width={32} height={32} />
          </Box>
          <ListItemText
            id={labelId}
            primary={isCreator ? `${listUser.username} (Du)` : listUser.username}
          />
        </ListItemButton>
      </ListItem>
    );
  };

  const renderOtherUsers = () => {
    if (loadFailed) {
      return (
        <ListItem sx={{ py: 2 }}>
          <Alert severity="error" sx={{ width: '100%' }}>
            Die Benutzerliste konnte nicht geladen werden.
          </Alert>
        </ListItem>
      );
    }

    if (otherUsers.length === 0) {
      return (
        <ListItem sx={{ py: 4 }}>
          <Stack spacing={1} sx={{ width: '100%', alignItems: 'center' }}>
            <GroupOff color="disabled" fontSize="large" />
            <Typography variant="body2" color="text.secondary">
              Keine weiteren verfügbaren Benutzer gefunden.
            </Typography>
          </Stack>
        </ListItem>
      );
    }

    return otherUsers.map((otherUser) => renderUserItem(otherUser));
  };

  return (
    <AppBarsWrapper>
      <Stack
        component="form"
        onSubmit={(event) => {
          event.preventDefault();
          if (canProceed) void handleSubmit();
        }}
        noValidate
        spacing={3}
        sx={{ alignItems: 'center', marginY: 3 }}
      >
        <Paper elevation={4} sx={{ width: generateSeparateStyle('80%', '60%'), p: 4 }}>
          <Box sx={{ flexShrink: 0 }}>
            <Typography variant="overline" color="text.secondary">
              Neue Gruppe
            </Typography>
            <Typography variant="h4">Gruppendetails</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {checkedMemberIds.length + 1} Mitglied(er) ausgewählt · mindestens 2 nötig
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ flexShrink: 0, mb: 3 }}>
            <TextField
              id="group-name-input"
              label="Gruppenname"
              required
              value={groupName}
              onChange={(event) => setGroupName(event.target.value)}
              variant="outlined"
              fullWidth
            />
          </Box>

          <Box sx={{ flexShrink: 0, mb: 1.5 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Group color="action" fontSize="small" />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
              >
                Mitglieder
              </Typography>
            </Stack>
          </Box>

          <List
            sx={{
              bgcolor: 'background.paper',
              width: '100%',
              flex: 1,
              maxHeight: 360,
              overflowY: 'auto',
              py: 0,
              mt: 0,
            }}
          >
            {isLoadingAllUsers ? (
              Array.from({ length: 5 }).map((_, index) => (
                <ListItem key={index}>
                  <Skeleton variant="circular" width={36} height={36} sx={{ mr: 2 }} />
                  <Skeleton variant="text" width="60%" />
                </ListItem>
              ))
            ) : (
              <>
                {renderUserItem(user, true)}
                <Divider component="li" sx={{ my: 1 }} />
                {renderOtherUsers()}
              </>
            )}
          </List>
        </Paper>

        <Button
          type="submit"
          variant="contained"
          startIcon={<GroupAdd />}
          disabled={!canProceed}
          loading={isSubmitting}
          sx={{ width: generateSeparateStyle('50%', '30%') }}
        >
          Gruppe erstellen
        </Button>
      </Stack>
    </AppBarsWrapper>
  );
}
