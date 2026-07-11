import {
  SpeedDial, SpeedDialAction, SpeedDialIcon,
  Stack, useMediaQuery,
} from "@mui/material";
import AppBarsWrapper from "./components/AppBarsWrapper/AppBarsWrapper.tsx";
import GroupCard from "./components/GroupCard/GroupCard.tsx";
import {theme} from "../theme.ts";
import {AddBox, GroupAdd} from "@mui/icons-material";

const actions = [
  { icon: <AddBox />, name: 'Add new Event' },
  { icon: <GroupAdd />, name: 'Add new Group' },
];

export default function HomePage() {
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <AppBarsWrapper>
      <Stack spacing={3} sx={{ alignItems: 'center', mt: '24px', mb: '24px' }}>
        {exampleGroups.map((group, index) => (
          <GroupCard key={index} groupName={group.groupName} />
        ))}
      </Stack>
      <SpeedDial
        ariaLabel="Add actions"
        FabProps={{ size: isMdUp ? 'large' : 'medium' }}
        sx={{ position: 'absolute', bottom: {xs: 62, md: 65}, right: {xs: 2, md: 10} }}
        icon={<SpeedDialIcon />}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            slotProps={{
              tooltip: {
                open: true,
                title: action.name,
              },
              staticTooltipLabel: {
                sx: {
                  width: 'max-content'
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
  { groupName: "Gruppe 1" },
  { groupName: "Gruppe 2" },
  { groupName: "Gruppe 1" },
  { groupName: "Gruppe 2" },
  { groupName: "Gruppe 1" },
  { groupName: "Gruppe 2" },
  { groupName: "Gruppe 1" },
  { groupName: "Gruppe 2" },
  { groupName: "Gruppe 1" },
  { groupName: "Gruppe 2" }
]