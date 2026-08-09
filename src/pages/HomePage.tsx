import {
  Button,
  Card,
  Skeleton,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Stack,
  Typography
} from '@mui/material';
import AppBarsWrapper from '../components/AppBarsWrapper.tsx';
import GroupCard from '../components/GroupCard.tsx';
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

  useEffect(() => {
    api
      .GET('/api/users/{user-id}/user-groups', {
        params: { path: { 'user-id': user.id } },
      })
      .then(({ data }) => setGroups(data ?? []))
      .finally(() => setIsLoadingGroups(false));
  }, [user]);

  return (
    <AppBarsWrapper>
      <Typography variant="h3" component="h1" sx={{ mt: '24px', mb: '24px', textAlign: 'center' }}>
        Hallo {user.username}
      </Typography>
      <Stack spacing={3} sx={{ alignItems: 'center', mt: '24px', mb: '24px' }}>
        {isLoadingGroups ? (
            <Card
              sx={{ width: generateSeparateStyle('70%', '60%')}}
            >
              <Skeleton variant="rectangular" width="auto" height={50} sx={{margin: "16px"}}/>
            </Card>
        ) : groups.length === 0 ? (
          <>
            <Typography variant="body1">Du bist noch in keiner Gruppe.</Typography>
            <Button variant="contained" onClick={() => navigate("/create-group")}>Neue Gruppe erstellen</Button>
          </>
        ) : (
          groups.map((group) => (
            <GroupCard key={group.id} groupName={group.name} />
          ))
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
    </AppBarsWrapper>
  );
}
