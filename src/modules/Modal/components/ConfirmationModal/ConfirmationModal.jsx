import React from 'react';
import styled from '@emotion/styled';
import { Box, Button, Paper, Typography } from '@mui/core';
import useConfirmationModal from '@/hooks/useConfirmationModal';

const StyledPaper = styled(Paper)`
  padding: 2rem;
  margin: auto;
  width: 40vw;
  max-height: 90vh;
  overflow: auto;
  text-align: center;
  border: 2px solid #000;
  box-shadow: ${(p) => p.theme.shadows[5]};
`;

function ConfirmationModal() {
  const { confirm, decline, modalProps } = useConfirmationModal();

  return (
    <StyledPaper elevation={3}>
      <Typography variant="text" gutterBottom>
        {modalProps.message || 'Esta seguro de que desea realizar esta acción?'}
      </Typography>
      <Box
        mt={3}
        p={2}
        display="flex"
        flexDirection="row"
        flexGrow={1}
        justifyContent="center"
      >
        <Box p={1}>
          <Button
            onClick={decline}
            fullWidth
            color="secondary"
            variant="contained"
          >
            {modalProps.btnCancel || 'Cancelar'}
          </Button>
        </Box>
        <Box p={1}>
          <Button
            onClick={confirm}
            fullWidth
            color="primary"
            variant="contained"
          >
            {modalProps.btnConfirm || 'Confirmar'}
          </Button>
        </Box>
      </Box>
    </StyledPaper>
  );
}

export default ConfirmationModal;
