import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useFormWizard } from '../FormWizardContext';
import { steps, WIZARD_BASE_PATH } from '../steps.config';
import {
  Avatar,
  Box,
  Checkbox,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Paper,
  Skeleton,
  Typography,
} from '@mui/material';
import { generateSeparateStyle } from '../../../utils/ThemeHelpers.ts';
import type { Schema } from '../../../api/types.ts';
import { api } from '../../../api/client.ts';
import { useAuthedUser } from '../../../auth/useAuthedUser.ts';
import type { FormUser } from '../formular.types.ts';
import GroupOffIcon from '@mui/icons-material/GroupOff';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';

type UserResponse = Schema<'UserResponse'>

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

export function UserSelection() {
  const user = useAuthedUser();
  const { data, updateStep, visitStep } = useFormWizard();
  const navigate = useNavigate();

  const [allUsers, setAllUsers] = useState<UserResponse[]>([]);
  const [isLoadingAllUsers, setIsLoadingAllUsers] = useState(true);

  const isUserChecked = (users: FormUser[], userToCheck: FormUser) =>
    users.some((checkedUser) => checkedUser.id === userToCheck.id);

  const [checkedUsers, setCheckedUsers] = useState<FormUser[]>(() =>
    isUserChecked(data.event.users, { id: user.id, name: user.username })
      ? data.event.users
      : [...data.event.users, { id: user.id, name: user.username }]
  );

  const canProceed = data.event.users.length >= 2;
  const conditionsStep = steps.find((step) => step.path === 'conditions');
  const eventDataStep = steps.find((step) => step.path === 'event-data');

  useEffect(() => {
    api
      .GET('/api/users', {})
      .then(({ data }) => {
        setAllUsers(data ?? [])
      })
      .finally(() => setIsLoadingAllUsers(false));
  }, []);

  useEffect(() => {
    visitStep('user-selection');
  }, [visitStep]);

  useEffect(() => {
    const isCurrentUserIncluded = isUserChecked(checkedUsers, { id: user.id, name: user.username });
    if (!isCurrentUserIncluded) {
      updateStep('event', { users: checkedUsers });
    }
  }, [data.event.users, user, checkedUsers, updateStep]);

  const otherUsers = useMemo(
    () => allUsers.filter((availableUser) => availableUser.id !== user.id),
    [allUsers, user.id]
  );

  const handleToggle = (toggledUser: FormUser) => () => {
    const exists = isUserChecked(checkedUsers, toggledUser);
    const newChecked = exists
      ? checkedUsers.filter((checkedUser) => checkedUser.id !== toggledUser.id)
      : [...checkedUsers, toggledUser];

    setCheckedUsers(newChecked);
    updateStep('event', { users: newChecked });
  };

  const renderUserItem = (availableUser: UserResponse, disabled = false) => {
    const labelId = `checkbox-list-label-${availableUser.id}`;
    const formUser = { id: availableUser.id, name: availableUser.username };
    const checked = disabled ? true : isUserChecked(checkedUsers, formUser);

    return (
      <ListItem
        key={availableUser.id}
        disablePadding
        secondaryAction={
          <Checkbox
            edge="end"
            checked={checked}
            disabled={disabled}
            onChange={handleToggle(formUser)}
            disableRipple
            slotProps={{ input: { 'aria-labelledby': labelId } }}
          />
        }
      >
        <ListItemButton onClick={handleToggle(formUser)} dense disabled={disabled}>
          <ListItemAvatar>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                fontSize: 14,
                bgcolor: disabled ? 'primary.main' : 'grey.400',
              }}
            >
              {getInitials(availableUser.username)}
            </Avatar>
          </ListItemAvatar>
          <ListItemText id={labelId} primary={availableUser.username} />
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <Stack spacing={3} sx={{ alignItems: 'center', marginY: 3 }}>
      <Paper
        elevation={4}
        sx={{
          width: generateSeparateStyle('80%', '60%'),
          maxHeight: 'calc(100vh - 260px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 3, pb: 2, flexShrink: 0 }}>
          <Typography variant="overline" color="text.secondary">
            Neuer Termin
          </Typography>
          <Typography variant="h4">
            Teilnehmer auswählen
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {checkedUsers.length} ausgewählt · mindestens 2 nötig
          </Typography>
        </Box>

        <Divider />

        <List
          sx={{
            bgcolor: 'background.paper',
            width: '100%',
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
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
              <ListSubheader disableSticky sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 12 }}>
                Organisator
              </ListSubheader>
              {renderUserItem(user, true)}

              <Divider component="li" />

              <ListSubheader disableSticky sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 12 }}>
                Weitere Teilnehmer
              </ListSubheader>
              {otherUsers.length === 0 ? (
                <ListItem sx={{ py: 4 }}>
                  <Stack spacing={1} sx={{ width: '100%', alignItems: 'center' }}>
                    <GroupOffIcon color="disabled" fontSize="large" />
                    <Typography variant="body2" color="text.secondary">
                      Keine weiteren verfügbaren Benutzer gefunden.
                    </Typography>
                  </Stack>
                </ListItem>
              ) : (
                otherUsers.map((availableUser) => renderUserItem(availableUser))
              )}
            </>
          )}
        </List>
      </Paper>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'center', mt: 1, width: generateSeparateStyle('80%', '60%') }}
      >
        <Button
          fullWidth
          variant="contained"
          startIcon={<AutoAwesomeIcon />}
          disabled={!canProceed}
          onClick={() => conditionsStep && navigate(`${WIZARD_BASE_PATH}/${conditionsStep.path}`)}
        >
          Terminvorschlag erhalten
        </Button>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<EditCalendarIcon />}
          disabled={!canProceed}
          onClick={() => eventDataStep && navigate(`${WIZARD_BASE_PATH}/${eventDataStep.path}`)}
        >
          Termindaten selbst festlegen
        </Button>
      </Stack>
    </Stack>
  );
}
