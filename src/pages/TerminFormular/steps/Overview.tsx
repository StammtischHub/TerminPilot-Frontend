import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import {steps, WIZARD_BASE_PATH} from "../steps.config.ts";
import {useFormWizard} from "../FormWizardContext.tsx";
import {useEffect} from "react";
import {useNavigate} from "react-router";
import {generateSeparateStyle} from "../../../utils/ThemeHelpers.ts";
import {Box, Chip, Paper, Typography} from "@mui/material";

export function Overview() {
  const { data, visitedSteps, visitStep } = useFormWizard();
  const navigate = useNavigate();

  const beginDate = data.event.begin.format('DD.MM.YYYY');
  const endDate = data.event.end.format('DD.MM.YYYY') === beginDate ? null : data.event.end.format('DD.MM.YYYY');

  const beginTime = data.event.begin.format('HH:mm');
  const endTime = data.event.end.format('HH:mm');

  useEffect(() => {
    visitStep('overview');
  }, [visitStep]);


  const currentStepIndex = steps.findIndex((step) => step.path === 'overview');
  const previousStep = steps.findLast((step, index) => index < currentStepIndex && visitedSteps.includes(step.path));
  const nextStep = steps[currentStepIndex + 1];

  return (
    <Stack spacing={3} sx={{ alignItems: 'center', marginY: 3 }}>
      <Paper elevation={4} sx={{ width: generateSeparateStyle('80%', '60%'), p: 3 }}>
        <Stack spacing={4}>
          <Typography variant="h4" color="text.secondary" sx={{ mb: 1.5 }}>
            {data.event.title}
          </Typography>

          <Box>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1.5 }}>
              {beginDate}{endDate ? ` - ${endDate}` : ''}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
              {beginTime} - {endTime}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1.5 }}>
              {data.event.location ?? ""}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1.5 }}>
              {data.event.notes ?? ""}
            </Typography>
          </Box>

          <Box>
            {data.event.users.map((checkedUser) => (
              <Chip
                key={checkedUser.id}
                label={checkedUser.name}
                sx={{ mr: 1, mb: 1 }}
              >
              </Chip>
            ))}
          </Box>
        </Stack>
      </Paper>

      <Stack direction="row" spacing={2}>
        {previousStep && (
          <Button
            variant="outlined"
            onClick={() => navigate(`${WIZARD_BASE_PATH}/${previousStep.path}`)}
          >
            Zurück
          </Button>
        )}
        <Button
          variant="contained"
          onClick={() => nextStep && navigate(`${WIZARD_BASE_PATH}/${nextStep.path}`)}
        >
          Termine einstellen
        </Button>
      </Stack>
    </Stack>
  )
}
