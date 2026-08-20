import {
  Button,
  Card,
  CardContent,
  Skeleton,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Stack,
  Typography
} from '@mui/material';
import AppBarsWrapper from '../components/AppBarsWrapper.tsx';
import GroupCard from '../components/GroupCard.tsx';
import EditGroupDialog from '../components/dialogs/EditGroupDialog.tsx';
import { AddBox, GroupAdd } from '@mui/icons-material';
import {generateSeparateStyle} from '../utils/ThemeHelpers.ts';
import {useNavigate} from 'react-router';
import type {Schema} from "../api/types.ts";
import {useEffect, useState} from "react";
import {api} from "../api/client.ts";
import {useAuthedUser} from "../auth/useAuthedUser.ts";

type UserGroupResponse = Schema<'UserGroupResponse'>

const actions = [
  { icon: <AddBox />, name: 'Neues Ereignis erstellen', path: '/event' },
  { icon: <GroupAdd />, name: 'Neue Gruppe erstellen', path: '/create-group' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const user = useAuthedUser();
  const [groups, setGroups] = useState<UserGroupResponse[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [editingGroup, setEditingGroup] = useState<UserGroupResponse | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    api
      .GET('/api/users/{user-id}/user-groups', {
        params: { path: { 'user-id': user.id } },
      })
      .then(({ data }) => setGroups(data ?? []))
      .finally(() => setIsLoadingGroups(false));
  }, [user]);

  const handleGroupSaved = (updatedGroup: UserGroupResponse) => {
    setGroups((prev) => prev.map((group) => (group.id === updatedGroup.id ? updatedGroup : group)));
  };

  const handleGroupDeleted = (groupId: number) => {
    setGroups((prev) => prev.filter((group) => group.id !== groupId));
  };

  return (
    <AppBarsWrapper>
      <Typography variant="h3" component="h1" sx={{ mt: '24px', mb: '24px', textAlign: 'center' }}>
        Hallo {user.username}
      </Typography>
      <Stack spacing={3} sx={{ alignItems: 'center', mt: '24px', mb: '24px' }}>
        {isLoadingGroups ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Card
              key={index}
              sx={{ width: generateSeparateStyle('70%', '60%'), display: 'flex', flexDirection: 'row' }}
            >
              <CardContent sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="text" width="50%" height={32} sx={{ marginLeft: '10px' }} />
              </CardContent>
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <Skeleton variant="circular" width={32} height={32} />
              </CardContent>
            </Card>
          ))
        ) : groups.length === 0 ? (
          <>
            <Typography variant="body1">Du bist noch in keiner Gruppe.</Typography>
            <Typography>Erstelle eine neue Gruppe, sodass du auf einen Klick ein neues Ereignisse für bestimmte Personen erstellen kannst.</Typography>
            <Button variant="contained" onClick={() => navigate("/create-group")}>Neue Gruppe erstellen</Button>
          </>
        ) : (
          <>
            <Typography variant="body1">Erstelle ein Ereignis für eine deiner Gruppen...</Typography>
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                groupName={group.name}
                onGroupNameClick={() => navigate(`/event/user-selection`, {state: {userGroupId: group.id}})}
                onSettingsClick={() => {
                  setEditingGroup(group)
                  setIsEditDialogOpen(true)
                }}
              />
            ))}
          </>
        )}
      </Stack>
      <SpeedDial
        ariaLabel="Add actions"
        FabProps={{ size: 'large' }}
        sx={{ position: 'absolute', bottom: generateSeparateStyle(10, 15), right: generateSeparateStyle(10, 15) }}
        icon={<SpeedDialIcon />}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            onClick={() => {
              navigate(action.path);
            }}
            slotProps={{
              tooltip: {
                open: true,
                title: action.name,
              },
              staticTooltipLabel: {
                sx: {
                  width: 'max-content',
                },
              },
            }}
          />
        ))}
      </SpeedDial>

      <EditGroupDialog
        key={editingGroup?.id ?? 'none'}
        open={isEditDialogOpen}
        group={editingGroup}
        onClose={() => {
          setEditingGroup(null);
          setIsEditDialogOpen(false);
        }}
        onSaved={handleGroupSaved}
        onDeleted={handleGroupDeleted}
      />
    </AppBarsWrapper>
  );
}
