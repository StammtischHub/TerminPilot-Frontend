import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useFormWizard } from '../FormWizardContext';
import { steps, WIZARD_BASE_PATH } from '../steps.config';
import {
  Checkbox,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper, Skeleton, Typography,
} from '@mui/material';
import { generateSeparateStyle } from '../../../utils/ThemeHelpers.ts';
import type {Schema} from "../../../api/types.ts";
import {api} from "../../../api/client.ts";
import {useAuthedUser} from "../../../auth/useAuthedUser.ts";
import type {FormUser} from "../formular.types.ts";

type UserResponse = Schema<'UserResponse'>

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

    return (
      <ListItem key={availableUser.id} disablePadding>
        <ListItemButton
          onClick={handleToggle({ id: availableUser.id, name: availableUser.username })}
          dense
          disabled={disabled}
        >
          <ListItemIcon>
            <Checkbox
              edge="end"
              checked={disabled ? true : isUserChecked(checkedUsers, { id: availableUser.id, name: availableUser.username })}
              disabled={disabled}
              disableRipple
              slotProps={{ input: { 'aria-labelledby': labelId } }}
            />
          </ListItemIcon>
          <ListItemText id={labelId} primary={`${availableUser.username}`} />
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <Stack spacing={2} sx={{ alignItems: 'center', marginY: 3 }}>
      <Paper elevation={4} sx={{ width: generateSeparateStyle('80%', '60%'), maxHeight: 500 }}>

        <List
          sx={{
            bgcolor: 'background.paper',
            width: '100%',
            maxHeight: 'inherit',
            overflow: 'auto',
          }}
        >
          {isLoadingAllUsers ? (
            <ListItem>
              <Skeleton variant="rectangular" width="100%" height={40} />
            </ListItem>
          ) : (
            <>
              {renderUserItem(user, true)}
              <Divider component="li" />

              {otherUsers.length === 0 ? (
                <ListItem>
                  <Typography variant="body1" sx={{ width: '100%', textAlign: 'center' }}>
                    Keine weiteren verfügbaren Benutzer gefunden.
                  </Typography>
                </ListItem>
              ) : (
                otherUsers.map((availableUser) => renderUserItem(availableUser))
              )}
            </>
          )}
        </List>
      </Paper>
      <Stack direction="row" spacing={2} sx={{ justifyContent: 'center', mt: 2 }}>
        <Button
          sx={{ width: generateSeparateStyle('40%', 'auto')}}
          variant="contained"
          disabled={!canProceed}
          onClick={() => conditionsStep && navigate(`${WIZARD_BASE_PATH}/${conditionsStep.path}`)}
        >
          Terminvorschlag erhalten
        </Button>
        <Button
          sx={{ width: generateSeparateStyle('40%', 'auto')}}
          variant="contained"
          disabled={!canProceed}
          onClick={() => eventDataStep && navigate(`${WIZARD_BASE_PATH}/${eventDataStep.path}`)}
        >
          Termindaten selbst festlegen
        </Button>
      </Stack>
    </Stack>
  );
}
