import {Card, CardActionArea, CardContent, Typography} from "@mui/material";
import {Group, Settings} from "@mui/icons-material";

type GroupCardProps = {
  groupName: string;
}

export default function GroupCard({ groupName }: GroupCardProps) {
  return (
    <Card sx={{ width: { xs: '70%', md: '60%'}, display: 'flex', flexDirection: 'row' }}>
      <CardActionArea>
        <CardContent sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <Group fontSize="large" />
          <Typography variant="h5" component="div" sx={{ marginLeft: '10px' }}>
            {groupName}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActionArea sx={{ width: 'auto' }}>
        <CardContent>
          <Settings />
        </CardContent>
      </CardActionArea>
    </Card>
  )
}