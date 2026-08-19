import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import {steps, WIZARD_BASE_PATH} from "../steps.config.ts";
import {useFormWizard} from "../FormWizardContext.tsx";
import {useEffect} from "react";
import type {ReactNode} from "react";
import {useNavigate} from "react-router";
import {generateSeparateStyle} from "../../../utils/ThemeHelpers.ts";
import {Box, Chip, Divider, Paper, Typography} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import NotesIcon from "@mui/icons-material/Notes";
import GroupIcon from "@mui/icons-material/Group";
import {useAuthedUser} from "../../../auth/useAuthedUser.ts";

function OverviewRow({icon, label, children}: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
      <Box sx={{ color: "text.secondary", mt: "2px" }}>{icon}</Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
        >
          {label}
        </Typography>
        <Box sx={{ mt: 0.5 }}>{children}</Box>
      </Box>
    </Stack>
  );
}

export function Overview() {
  const { data, visitedSteps, visitStep } = useFormWizard();
  const { id } = useAuthedUser();
  const navigate = useNavigate();

  const beginDate = data.event.begin.toString();
  const endDate = data.event.end.equals(data.event.begin) ? null : data.event.end.toString();

  const beginTime = data.event.begin.toString();
  const endTime = data.event.end.toString();

  useEffect(() => {
    visitStep('overview');
  }, [visitStep]);

  const currentStepIndex = steps.findIndex((step) => step.path === 'overview');
  const previousStep = steps.findLast((step, index) => index < currentStepIndex && visitedSteps.includes(step.path));
  const nextStep = steps[currentStepIndex + 1];

  return (
    <Stack spacing={3} sx={{ alignItems: 'center', marginY: 3 }}>
      <Paper elevation={4} sx={{ width: generateSeparateStyle('80%', '60%'), p: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="overline" color="text.secondary">
              Terminübersicht
            </Typography>
            <Typography variant="h4">
              {data.event.title || "Ohne Titel"}
            </Typography>
          </Box>

          <Divider />

          <OverviewRow icon={<EventIcon />} label="Datum">
            <Typography variant="body1">
              {beginDate}{endDate ? ` – ${endDate}` : ''}
            </Typography>
          </OverviewRow>

          <OverviewRow icon={<AccessTimeIcon />} label="Uhrzeit">
            <Typography variant="body1">
              {beginTime} – {endTime} Uhr
            </Typography>
          </OverviewRow>

          {data.event.location && (
            <OverviewRow icon={<LocationOnIcon />} label="Ort">
              <Typography variant="body1">{data.event.location}</Typography>
            </OverviewRow>
          )}

          {data.event.notes && (
            <OverviewRow icon={<NotesIcon />} label="Notizen">
              <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                {data.event.notes}
              </Typography>
            </OverviewRow>
          )}

          <OverviewRow icon={<GroupIcon />} label={`Teilnehmer (${data.event.users.length})`}>
            {data.event.users.length > 0 ? (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {data.event.users.map((checkedUser) => (
                  <Chip key={checkedUser.id} label={checkedUser.id === id ? `${checkedUser.name} (Du)` : checkedUser.name} size="small" />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Keine Teilnehmer ausgewählt
              </Typography>
            )}
          </OverviewRow>
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
  );
}
