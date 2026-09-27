import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Skeleton,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Stack,
  Typography,
} from '@mui/material';
import { AddBox, GroupAdd } from '@mui/icons-material';
import { useNavigate } from 'react-router';
import AppBarsWrapper from '../components/AppBarsWrapper.tsx';
import FeedbackSnackbar, { type Feedback } from '../components/FeedbackSnackbar.tsx';
import GroupCard from '../components/GroupCard.tsx';
import EditGroupDialog from '../components/dialog/EditGroupDialog.tsx';
import { generateSeparateStyle } from '../utils/ThemeHelpers.ts';
import { api } from '../api/client.ts';
import type { Schema } from '../api/types.ts';
import { useAuthedUser } from '../auth/useAuthedUser.ts';

type UserGroupResponse = Schema<'UserGroupResponse'>;

const actions = [
  { icon: <AddBox />, name: 'Neues Ereignis erstellen', path: '/event' },
  { icon: <GroupAdd />, name: 'Neue Gruppe erstellen', path: '/create-group' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const user = useAuthedUser();

  const [groups, setGroups] = useState<UserGroupResponse[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [editingGroup, setEditingGroup] = useState<UserGroupResponse | null>(null);
  const [isEditGroupDialogOpen, setIsEditGroupDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    api
      .GET('/api/users/{user-id}/user-groups', {
        params: { path: { 'user-id': user.id } },
        signal: controller.signal,
      })
      .then(({ data, error }) => {
        if (error) {
          setLoadFailed(true);
          return;
        }
        setLoadFailed(false);
        setGroups(data ?? []);
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoadFailed(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingGroups(false);
      });

    return () => controller.abort();
  }, [user.id]);

  const onGroupSave = (updatedGroup: UserGroupResponse) => {
    setGroups((prev) => prev.map((group) => (group.id === updatedGroup.id ? updatedGroup : group)));
    setFeedback({
      severity: 'success',
      message: `Die Gruppe „${updatedGroup.name}" wurde gespeichert.`,
    });
  };

  const onGroupDelete = (groupId: number) => {
    setGroups((prev) => prev.filter((group) => group.id !== groupId));
    setFeedback({ severity: 'success', message: 'Die Gruppe wurde gelöscht.' });
  };

  const renderGroups = () => {
    if (isLoadingGroups) {
      return Array.from({ length: 3 }).map((_, index) => (
        <Card
          key={index}
          sx={{ width: generateSeparateStyle('70%', '60%'), display: 'flex', flexDirection: 'row' }}
        >
          <CardContent
            sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flex: 1 }}
          >
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="text" width="50%" height={32} sx={{ ml: '10px' }} />
          </CardContent>
          <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
            <Skeleton variant="circular" width={32} height={32} />
          </CardContent>
        </Card>
      ));
    }

    if (loadFailed) {
      return (
        <Alert severity="error" sx={{ width: generateSeparateStyle('70%', '60%') }}>
          Deine Gruppen konnten nicht geladen werden.
        </Alert>
      );
    }

    if (groups.length === 0) {
      return (
        <>
          <Typography variant="body1">Du bist noch in keiner Gruppe.</Typography>
          <Typography>
            Erstelle eine neue Gruppe, sodass du auf einen Klick ein neues Ereignis für bestimmte
            Personen erstellen kannst.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/create-group')}>
            Neue Gruppe erstellen
          </Button>
        </>
      );
    }

    return (
      <>
        <Typography variant="body1">Erstelle ein Ereignis für eine deiner Gruppen...</Typography>
        {groups.map((group) => (
          <GroupCard
            key={group.id}
            groupName={group.name}
            onGroupNameClick={() =>
              navigate('/event/user-selection', { state: { userGroupId: group.id } })
            }
            onSettingsClick={() => {
              setEditingGroup(group);
              setIsEditGroupDialogOpen(true);
            }}
          />
        ))}
      </>
    );
  };

  return (
    <AppBarsWrapper>
      <Typography variant="h3" component="h1" sx={{ my: 3, textAlign: 'center' }}>
        Hallo {user.username}
      </Typography>

      <Stack spacing={3} sx={{ alignItems: 'center', my: 3, textAlign: 'center' }}>
        {renderGroups()}
      </Stack>

      <SpeedDial
        ariaLabel="Add actions"
        FabProps={{ size: 'large' }}
        sx={{
          position: 'absolute',
          bottom: generateSeparateStyle(10, 15),
          right: generateSeparateStyle(10, 15),
        }}
        icon={<SpeedDialIcon />}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            onClick={() => navigate(action.path)}
            slotProps={{
              tooltip: { open: true, title: action.name },
              staticTooltipLabel: { sx: { width: 'max-content' } },
            }}
          />
        ))}
      </SpeedDial>

      <EditGroupDialog
        key={editingGroup?.id ?? null}
        open={isEditGroupDialogOpen}
        group={editingGroup}
        onClose={() => {
          setEditingGroup(null);
          setIsEditGroupDialogOpen(false);
        }}
        onSave={onGroupSave}
        onDelete={onGroupDelete}
      />

      <FeedbackSnackbar feedback={feedback} onClose={() => setFeedback(null)} />
    </AppBarsWrapper>
  );
}
