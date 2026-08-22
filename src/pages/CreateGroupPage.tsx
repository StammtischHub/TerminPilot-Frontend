import AppBarsWrapper from "../components/AppBarsWrapper.tsx";
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
  Paper,
  Skeleton,
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
import GroupIcon from "@mui/icons-material/Group";
import GroupOffIcon from "@mui/icons-material/GroupOff";
import GroupAddIcon from "@mui/icons-material/GroupAdd";

type UserResponse = Schema<'UserResponse'>

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

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

  const [checkedMembers, setCheckedMembers] = useState<FormUser[]>([]);

  const canProceed = checkedMembers.length >= 1 && groupName.trim().length > 0;

  const otherUsers = useMemo(
    () => allUsers.filter((availableUser) => availableUser.id !== user.id),
    [allUsers, user.id]
  );

  const handleToggle = (toggledUser: FormUser) => () => {
    const exists = isUserChecked(checkedMembers, toggledUser);
    const newChecked = exists
      ? checkedMembers.filter((checkedUser) => checkedUser.id !== toggledUser.id)
      : [...checkedMembers, toggledUser];

    setCheckedMembers(newChecked);
  };

  const handleSubmit = () => {
    api
      .POST('/api/user-groups', {
        body: {
          name: groupName,
          creatorId: user.id,
          memberIds: checkedMembers.map((user) => user.id),
        },
      })
      .then(() => {})
      .finally(() => navigate("/home"));
  }

  const renderUserItem = (availableUser: UserResponse, organizer = false) => {
    const labelId = `checkbox-list-label-${availableUser.id}`;
    const formUser = { id: availableUser.id, name: availableUser.username };
    const checked = organizer ? true : isUserChecked(checkedMembers, formUser);

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
    <AppBarsWrapper>
      <Stack spacing={3} sx={{ alignItems: 'center', marginY: 3 }}>
        <Paper
          elevation={4}
          sx={{
            width: generateSeparateStyle('80%', '60%'),
            p: 4
          }}
        >
          <Box sx={{ flexShrink: 0 }}>
            <Typography variant="overline" color="text.secondary">
              Neue Gruppe
            </Typography>
            <Typography variant="h4">
              Gruppendetails
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {checkedMembers.length + 1} Mitglied(er) ausgewählt · mindestens 2 nötig
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

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
              <GroupIcon color="action" fontSize="small" />
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
              minHeight: 175,
              maxHeight: 360,
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
                {renderUserItem(user, true)}
                <Divider component="li" sx={{ my: 1 }} />

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

        <Button
          variant="contained"
          startIcon={<GroupAddIcon />}
          disabled={!canProceed}
          onClick={() => handleSubmit()}
          sx={{ width: generateSeparateStyle('50%', '30%') }}
        >
          Gruppe erstellen
        </Button>
      </Stack>
    </AppBarsWrapper>
  )
}
