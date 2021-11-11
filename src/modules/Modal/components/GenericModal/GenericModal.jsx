import React from 'react';
import { useDispatch } from 'react-redux';
import { Box, Button, Grid, Paper } from '@mui/material';
import styled from '@emotion/styled';
import { closeModal } from '@/modules/Modal/modalSlice';

// const StyledPaper = styled(Paper)`
//   padding: 3rem;
//   margin: auto;
//   position: absolute;
//   top: 50%;
//   left: 50%;
//   transform: translate(-50%, -50%);
//   text-align: center;
//   border: 2px solid #000;
//   /* box-shadow: ${(p) => p.theme.shadows[5]}; */
// `;

function GenericModal({ handlers, modalProps = {} }) {
  const dispatch = useDispatch();
  const defaultHeader = 'Importante';
  const defaultContent = 'Contenido';
  const handleExit = () => {
    dispatch(closeModal());
  };
  const handleAccept = () => {
    dispatch(closeModal());
  };

  const defaultHandlers = {
    handleExit,
    handleAccept,
  };
  const defaultButtons = [
    {
      type: 'exit',
      variant: 'contained',
      color: 'secondary',
      text: 'Salir',
      handler: handleExit,
    },
    {
      type: 'accept',
      variant: 'contained',
      color: 'primary',
      text: 'Aceptar',
      handler: handleAccept,
    },
  ];
  const {
    header = defaultHeader,
    content = defaultContent,
    buttons = defaultButtons,
  } = modalProps;

  return (
    <Paper elevation={5}>
      <Grid
        container
        direction="column"
        justify="center"
        alignItems="stretch"
        spacing={4}
      >
        <Grid item>Algun ICONO</Grid>
        <Grid item>{header}</Grid>
        <Grid item>{content}</Grid>
        <Grid item>
          <Box display="flex" justifyContent="space-between">
            {buttons.map((button, idx) => {
              return (
                <Button
                  variant={button.variant}
                  color={button.color}
                  key={idx}
                  onClick={button.handler}
                >
                  {button.text}
                </Button>
              );
            })}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default GenericModal;
