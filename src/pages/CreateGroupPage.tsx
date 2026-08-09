import AppBarsWrapper from "../components/AppBarsWrapper.tsx";
import {
  Box,
  Checkbox, Divider, List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper, Skeleton,
  TextField,
  Typography
} from "@mui/material";
import {generateSeparateStyle} from "../utils/ThemeHelpers.ts";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import {useEffect, useMemo, useState} from "react";
import type {FormUser} from "./TerminFormular/formular.types.ts";
import {api} from "../api/client.ts";
import type {Schema} from "../api/types.ts";
import {useAuthedUser} from "../auth/useAuthedUser.ts";
import {useNavigate} from "react-router";

type UserResponse = Schema<'UserResponse'>

export default function CreateGroupPage () {
  const navigate = useNavigate();

  const user = useAuthedUser();
  const [groupName, setGroupName] = useState("");
  const [allUsers, setAllUsers] = useState<UserResponse[]>([]);
  const [isLoadingAllUsers, setIsLoadingAllUsers] = useState(true);

  useEffect(() => {
    api
      .GET('/api/users', {})
      .then(({ data }) => {
        setAllUsers(data ?? [])
      })
      .finally(() => setIsLoadingAllUsers(false));
  }, []);

  const isUserChecked = (users: FormUser[], userToCheck: FormUser) =>
    users.some((checkedUser) => checkedUser.id === userToCheck.id);

  const [checkedUsers, setCheckedUsers] = useState<FormUser[]>([{id: user.id, name: user.username}]);

  const canProceed = checkedUsers.length >= 2 && groupName.length > 0;

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
  };

  const handleSubmit = () => {
    api.
      POST('/api/user-groups', {
        body: {
          name: groupName,
          "member-ids": checkedUsers.map((user) => user.id),
        },
      })
      .then(() => {})
      .finally(() => navigate("/home"));
  }

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
    <AppBarsWrapper>
      <Stack spacing={3} sx={{ alignItems: 'center', marginY: 3 }}>
        <Typography variant="h4" component="h1" sx={{ mt: '24px', mb: '24px', textAlign: 'center' }}>
          Neue Gruppe erstellen
        </Typography>
        <Paper elevation={4} sx={{ width: generateSeparateStyle('80%', '60%'), p: 3 }}>
          <Stack spacing={4}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
                Gruppenname
              </Typography>
              <TextField
                id="group-name-input"
                required
                value={groupName}
                onChange={(event) => setGroupName(event.target.value)}
                variant="outlined"
                label="Gruppenname"
                fullWidth
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
                Mitglieder
              </Typography>
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
            </Box>
          </Stack>
        </Paper>

        <Button
          variant="contained"
          disabled={!canProceed}
          onClick={() => {handleSubmit()}}
        >
          Gruppe erstellen
        </Button>
      </Stack>
    </AppBarsWrapper>
  )
}
