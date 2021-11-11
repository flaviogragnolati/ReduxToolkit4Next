import { Grid, Stack, Button, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { increment, decrement } from '@/modules/Counter/counterSlice';
import { countSelector } from '@/modules/Counter/counterSelectors';

export default function Home() {
  const dispatch = useDispatch();
  const count = useSelector(countSelector);

  const handleIncrement = () => {
    dispatch(increment());
  };

  const handleDecrement = () => {
    dispatch(decrement());
  };

  return (
    <Grid
      container
      spacing={5}
      justifyContent="center"
      direction="column"
      alignContent="center"
    >
      <Grid item xs={4}>
        <Typography variant="h1">{count}</Typography>
      </Grid>
      <Grid item xs={4}>
        <Stack spacing={5} direction="row">
          <Button variant="contained" onClick={handleIncrement}>
            Increase
          </Button>
          <Button variant="contained" onClick={handleDecrement}>
            Decrease
          </Button>
          <Button variant="contained">Open Pop Up</Button>
          <Button variant="contained">Fetch Props</Button>
        </Stack>
      </Grid>
    </Grid>
  );
}
