import type { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';

type SectionHeaderProps = {
  icon: ReactNode;
  title: string;
};

export default function SectionHeader({ icon, title }: SectionHeaderProps) {
  return (
    <Box sx={{ flexShrink: 0, mb: 2 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        {icon}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
        >
          {title}
        </Typography>
      </Stack>
    </Box>
  );
}
