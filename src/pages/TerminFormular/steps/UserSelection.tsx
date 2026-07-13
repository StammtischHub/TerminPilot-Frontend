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
} from '@mui/material';

export function UserSelection() {
  const { data, updateStep, visitStep } = useFormWizard();
  const navigate = useNavigate();

  useEffect(() => {
    visitStep('user-selection');
  }, [visitStep]);

  const canProceed = data.users.length != 0;

  const [checked, setChecked] = useState([1]);

  const handleToggle = (value: number) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
    updateStep('users', newChecked);
  };

  return (
    <Stack spacing={2} sx={{ alignItems: 'center', mt: '24px', mb: '24px' }}>
      <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper', ml: '24px' }}>
        {exampleUsers.map((user) => {
          const labelId = `checkbox-list-label-${user.id}`;

          return (
            <ListItem key={user.id} disablePadding>
              <ListItemButton onClick={handleToggle(user.id)} dense>
                <ListItemIcon>
                  <Checkbox
                    edge="end"
                    checked={checked.includes(user.id)}
                    tabIndex={-1}
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
      <Button
        variant="contained"
        disabled={!canProceed}
        onClick={() => navigate(`${WIZARD_BASE_PATH}/${steps[1].path}`)}
      >
        Weiter
      </Button>
    </Stack>
  );
}

const exampleUsers = [
  { name: 'Leon', id: 1 },
  { name: 'Jannis', id: 2 },
];
