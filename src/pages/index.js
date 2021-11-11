import { Grid, Stack, Button, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { increment, decrement } from '@/modules/Counter/counterSlice';
import { countSelector } from '@/modules/Counter/counterSelectors';
import { setModal } from '@/modules/Modal/modalSlice';
import { MODAL_TYPES } from '@/config/modalTypes';

export default function Home() {
  const dispatch = useDispatch();
  const count = useSelector(countSelector);

  const handleIncrement = () => {
    dispatch(increment());
  };

  const handleDecrement = () => {
    dispatch(decrement());
  };

  const handleOpenModal = () => {
    dispatch(
      setModal({
        type: MODAL_TYPES.genericModal,
        modalProps: { header: 'titulo por props' },
      })
    );
  };

  const handleFetch = () => {};

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
          <Button variant="contained" onClick={handleOpenModal}>
            Open Confirmation modal
          </Button>
          <Button variant="contained" onClick={handleOpenModal}>
            Fetch Props
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
}
