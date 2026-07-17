import { SpeedDial, SpeedDialAction, SpeedDialIcon, Stack, useMediaQuery } from '@mui/material';
import AppBarsWrapper from './components/AppBarsWrapper.tsx';
import GroupCard from './components/GroupCard.tsx';
import { AddBox, GroupAdd } from '@mui/icons-material';
import { isMobile } from '../tools/ThemeHelpers.ts';
import {useNavigate} from "react-router";

const actions = [
  { icon: <AddBox />, name: 'Add new Event', path: '/event' },
  { icon: <GroupAdd />, name: 'Add new Group', path: '' },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <AppBarsWrapper>
      <Stack spacing={3} sx={{ alignItems: 'center', mt: '24px', mb: '24px' }}>
        {exampleGroups.map((group, index) => (
          <GroupCard key={index} groupName={group.groupName} />
        ))}
      </Stack>
      <SpeedDial
        ariaLabel="Add actions"
        FabProps={{ size: useMediaQuery(isMobile) ? 'medium' : 'large' }}
        sx={{ position: 'absolute', bottom: { xs: 62, md: 65 }, right: { xs: 2, md: 10 } }}
        icon={<SpeedDialIcon />}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            onClick={() => {navigate(action.path)}}
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

const exampleGroups = [
  { groupName: 'Gruppe 1' },
  { groupName: 'Gruppe 2' },
  { groupName: 'Gruppe 1' },
  { groupName: 'Gruppe 2' },
  { groupName: 'Gruppe 1' },
  { groupName: 'Gruppe 2' },
  { groupName: 'Gruppe 1' },
  { groupName: 'Gruppe 2' },
  { groupName: 'Gruppe 1' },
  { groupName: 'Gruppe 2' },
];
