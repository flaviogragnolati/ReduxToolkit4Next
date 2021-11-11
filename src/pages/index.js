import _ from 'lodash';
import {
  Grid,
  Stack,
  Button,
  Typography,
  Switch,
  Box,
  CircularProgress,
  FormGroup,
  FormControlLabel,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { increment, decrement } from '@/modules/Counter/counterSlice';
import { countSelector } from '@/modules/Counter/counterSelectors';
import {
  dataStatus,
  displayDataSelector,
  dataSelector,
} from '@/modules/Dashboard/dashboardSelectors';
import { setModal } from '@/modules/Modal/modalSlice';
import { MODAL_TYPES } from '@/config/modalTypes';
import { getData, toggleDisplayData } from '@/modules/Dashboard/dashboardSlice';
import { STATUS } from '@/constants/thunkStates';

export default function Home() {
  const dispatch = useDispatch();
  const count = useSelector(countSelector);
  const status = useSelector(dataStatus);
  const displayData = useSelector(displayDataSelector);
  const data = useSelector(dataSelector);
  console.log('DFASTA', data);

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

  const handleFetch = () => {
    dispatch(getData());
  };

  const handleChange = () => {
    dispatch(toggleDisplayData());
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
        <Stack spacing={5} direction="row" justifyContent="center">
          <Typography variant="h1">{count}</Typography>
          {status === STATUS.pending && (
            <Box
              sx={{
                display: 'flex',
              }}
            >
              <CircularProgress />
            </Box>
          )}
        </Stack>
      </Grid>
      <Grid item xs={4}>
        <Stack spacing={5} direction="row">
          <Button variant="contained" color="success" onClick={handleIncrement}>
            Increase
          </Button>
          <Button variant="contained" color="error" onClick={handleDecrement}>
            Decrease
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleOpenModal}
          >
            Open Confirmation modal
          </Button>
          <Button variant="contained" onClick={handleFetch}>
            Fetch Props
          </Button>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={displayData}
                  color="warning"
                  onChange={handleChange}
                />
              }
              label="mostrar data"
            />
          </FormGroup>
        </Stack>
      </Grid>
      {displayData && (
        <Grid item xs={6}>
          <Typography variant="h2" gutterBottom>
            Aca esta la data
          </Typography>
          <Stack spacing={3} direction="row">
            {data?.length > 0 ? (
              <Stack spacing={3} direction="column">
                {data.map((item, idx) => {
                  return (
                    <Stack spacing={3} direction="column" key={idx}>
                      <Typography variant="h6">ID: {item.id}</Typography>
                      <Typography variant="subtitle">
                        Titulo: {item.title}
                      </Typography>
                      <Typography variant="caption">
                        Extra: {item.extra}
                      </Typography>
                    </Stack>
                  );
                })}
              </Stack>
            ) : (
              <Typography variant="h3">No hay data</Typography>
            )}
          </Stack>
        </Grid>
      )}
    </Grid>
  );
}
