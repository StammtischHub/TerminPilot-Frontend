import { useEffect, useMemo, useState } from 'react';
import {useLocation, useNavigate} from 'react-router';
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
  Typography, useMediaQuery,
} from '@mui/material';
import {generateSeparateStyle, isMobile} from '../../../utils/ThemeHelpers.ts';
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
  const mobile = useMediaQuery(isMobile)
  const location = useLocation();
  const state = location.state || {};
  const navigate = useNavigate();

  const authenticatedUser = useAuthedUser();

  const { data, visitedSteps, updateStep, visitStep } = useFormWizard();
  const [allUsers, setAllUsers] = useState<UserResponse[]>([]);
  const [isLoadingAllUsers, setIsLoadingAllUsers] = useState(true);

  const isUserChecked = (users: FormUser[], userToCheck: FormUser) =>
    users.some((checkedUser) => checkedUser.id === userToCheck.id);

  const [checkedUsers, setCheckedUsers] = useState<FormUser[]>(() =>
    isUserChecked(data.event.users, { id: authenticatedUser.id, name: authenticatedUser.username })
      ? data.event.users
      : [...data.event.users, { id: authenticatedUser.id, name: authenticatedUser.username }]
  );

  useEffect(() => {
    api
      .GET('/api/users', {})
      .then(({ data }) => {
        setAllUsers(data ?? [])
      })
      .finally(() => setIsLoadingAllUsers(false));
  }, []);


  useEffect(() => {
    if (!state.userGroupId || visitedSteps.includes("user-selection")) return

    api
      .GET('/api/users/{user-id}/user-groups', {
        params: {
          path: {"user-id": authenticatedUser.id},
          query: {"user-group-id": state.userGroupId}
        }
      })
      .then(({data}) => {
        const uniqueMembers = Array.from(
          new Map(
            (data ?? [])
              .flatMap((group) => group.members)
              .map((member) => [member.id, member])
          ).values()
        );
        setCheckedUsers(uniqueMembers);
      })
  }, [authenticatedUser.id, state.userGroupId, visitedSteps])

  useEffect(() => {
    visitStep('user-selection');
  }, [visitStep]);

  useEffect(() => {
    updateStep('event', { users: checkedUsers });
  }, [checkedUsers, updateStep])

  const otherUsers = useMemo(
    () => allUsers.filter((availableUser) => availableUser.id !== authenticatedUser.id),
    [allUsers, authenticatedUser.id]
  );


  const handleToggle = (toggledUser: FormUser) => () => {
    const exists = isUserChecked(checkedUsers, toggledUser);
    const newChecked = exists
      ? checkedUsers.filter((checkedUser) => checkedUser.id !== toggledUser.id)
      : [...checkedUsers, toggledUser];

    setCheckedUsers(newChecked);
  };

  const canProceed = data.event.users.length >= 2;
  const constraintsStep = steps.find((step) => step.path === 'constraints');
  const eventDataStep = steps.find((step) => step.path === 'event-data');

  const renderUserItem = (availableUser: UserResponse, organizer = false) => {
    const labelId = `checkbox-list-label-${availableUser.id}`;
    const formUser = { id: availableUser.id, name: availableUser.username };
    const checked = organizer ? true : isUserChecked(checkedUsers, formUser);

    return (
      <ListItem
        key={availableUser.id}
        disablePadding
        secondaryAction={
          <Checkbox
            edge="end"
            checked={checked}
            disabled={organizer}
            onChange={handleToggle(formUser)}
            disableRipple
            slotProps={{ input: { 'aria-labelledby': labelId } }}
          />
        }
      >
        <ListItemButton onClick={handleToggle(formUser)} disabled={organizer}>
          <ListItemAvatar>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                fontSize: 14,
                bgcolor: organizer ? 'primary.main' : 'grey.400',
              }}
            >
              {getInitials(availableUser.username)}
            </Avatar>
          </ListItemAvatar>
          <ListItemText id={labelId} primary={organizer ? `${availableUser.username} (Du)` : availableUser.username} />
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <Stack spacing={3} sx={{ alignItems: 'center', my: 3 }}>
      <Paper
        elevation={4}
        sx={{
          width: generateSeparateStyle('80%', '60%'),
          p: 4
        }}
      >
          <Box sx={{ flexShrink: 0 }}>
            <Typography variant="overline" color="text.secondary">
              Neuer Termin
            </Typography>
            <Typography variant="h4">
              Teilnehmer auswählen
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {checkedUsers.length} Teilnehmer ausgewählt · mindestens 2 nötig
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }}/>

          <List
            sx={{
              bgcolor: 'background.paper',
              width: '100%',
              flex: 1,
              minHeight: 175,
              maxHeight: 420,
              overflowY: 'auto',
              py: 0,
              mt: 0
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
                <ListSubheader disableSticky sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 12, lineHeight: 'normal', pl: 0 }}>
                  Organisator
                </ListSubheader>
                {renderUserItem(authenticatedUser, true)}
                <Divider component="li" sx={{ mt: 2, mb: 3 }} />

                <ListSubheader disableSticky sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 12, lineHeight: 'normal', pl: 0 }}>
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
        direction={mobile ? 'column' : 'row'}
        spacing={2}
        sx={{ justifyContent: 'center', mt: 1, width: generateSeparateStyle('80%', '60%') }}
      >
        <Button
          fullWidth
          variant="contained"
          startIcon={<AutoAwesomeIcon />}
          disabled={!canProceed}
          onClick={() => constraintsStep && navigate(`${WIZARD_BASE_PATH}/${constraintsStep.path}`)}
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
