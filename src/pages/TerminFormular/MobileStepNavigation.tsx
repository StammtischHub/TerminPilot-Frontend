import MobileStepper from "@mui/material/MobileStepper";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import { useLocation, useNavigate } from "react-router";
import { steps, WIZARD_BASE_PATH } from "./steps.config";

export function MobileStepNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeIndex = steps.findIndex((s) => location.pathname.endsWith(s.path));

  const canGoNext = activeIndex < steps.length - 1;
  const canGoBack = activeIndex > 0;

  return (
    <>
      <Typography align="center" variant="subtitle2" sx={{ mt: 1 }}>
        {steps[activeIndex]?.label}
      </Typography>
      <MobileStepper
        variant="dots"
        steps={steps.length}
        position="static"
        activeStep={activeIndex}
        backButton={
          <Button
            size="small"
            disabled={!canGoBack}
            onClick={() => navigate(`${WIZARD_BASE_PATH}/${steps[activeIndex - 1].path}`)}
          >
            <KeyboardArrowLeft />
            Zurück
          </Button>
        }
        nextButton={
          <Button
            size="small"
            disabled={!canGoNext}
            onClick={() => navigate(`${WIZARD_BASE_PATH}/${steps[activeIndex + 1].path}`)}
          >
            Weiter
            <KeyboardArrowRight />
          </Button>
        }
      />
    </>
  );
}
