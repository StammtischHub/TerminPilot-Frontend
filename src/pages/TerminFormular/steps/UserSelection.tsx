import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useFormWizard } from '../FormWizardContext';
import { steps, WIZARD_BASE_PATH } from '../steps.config';
import {
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
} from '@mui/material';
import { generateSeparateStyle } from '../../../utils/ThemeHelpers.ts';

export function UserSelection() {
  const { data, updateStep, visitStep } = useFormWizard();
  const navigate = useNavigate();

  useEffect(() => {
    visitStep('user-selection');
  }, [visitStep]);

  const canProceed = data.userSelection.users.length != 0;

  const [checked, setChecked] = useState(data.userSelection.users);

  const handleToggle = (value: number) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
    updateStep('userSelection', { users: newChecked });
  };

  const currentStepIndex = steps.findIndex((step) => step.path === 'user-selection');
  const nextStep = steps[currentStepIndex + 1];

  return (
    <Stack spacing={2} sx={{ alignItems: 'center', mt: '24px', mb: '24px' }}>
      <Paper elevation={4} sx={{ width: generateSeparateStyle('80%', '60%'), maxHeight: 500 }}>
        <List
          sx={{
            bgcolor: 'background.paper',
            width: '100%',
            maxHeight: 'inherit',
            overflow: 'auto',
          }}
        >
          {exampleUsers.map((user) => {
            const labelId = `checkbox-list-label-${user.id}`;

            return (
              <ListItem key={user.id} disablePadding>
                <ListItemButton onClick={handleToggle(user.id)} dense>
                  <ListItemIcon>
                    <Checkbox
                      edge="end"
                      checked={checked.includes(user.id)}
                      disableRipple
                      slotProps={{ input: { 'aria-labelledby': labelId } }}
                    />
                  </ListItemIcon>
                  <ListItemText id={labelId} primary={`${user.name}`} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Paper>
      <Button
        variant="contained"
        disabled={!canProceed}
        onClick={() => nextStep && navigate(`${WIZARD_BASE_PATH}/${nextStep.path}`)}
      >
        Weiter
      </Button>
    </Stack>
  );
}

const exampleUsers = [
  { name: 'Leon', id: 1 },
  { name: 'Jannis', id: 2 },
  { name: 'Leon', id: 3 },
  { name: 'Jannis', id: 4 },
  { name: 'Leon', id: 5 },
  { name: 'Jannis', id: 6 },
  { name: 'Leon', id: 7 },
  { name: 'Jannis', id: 8 },
  { name: 'Leon', id: 9 },
  { name: 'Jannis', id: 10 },
  { name: 'Leon', id: 11 },
  { name: 'Jannis', id: 12 },
  { name: 'Leon', id: 13 },
  { name: 'Jannis', id: 14 },
  { name: 'Leon', id: 15 },
  { name: 'Jannis', id: 16 },
];
