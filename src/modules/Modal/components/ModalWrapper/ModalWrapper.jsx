import React from 'react';
import styled from '@emotion/styled';
import Modal from '@mui/material/Modal';

const CenterDiv = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

function ModalWrapper({ handleClose, children, ...rest }) {
  return (
    <Modal open={true} onClose={handleClose}>
      <CenterDiv>{children}</CenterDiv>
    </Modal>
  );
}

export default ModalWrapper;
