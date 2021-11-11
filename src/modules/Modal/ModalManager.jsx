import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { modalStackSelector } from '@/modules/Modal/modalSelectors';
import { closeModal } from '@/modules/Modal/modalSlice';
import allModals from '@/modules/Modal/allModals';
import ModalWrapper from '@/modules/Modal/components/ModalWrapper';

function ModalManager() {
  const dispatch = useDispatch();
  let stack = useSelector(modalStackSelector);

  const handleClose = () => {
    dispatch(closeModal());
  };

  const handlers = { handleClose };
  const renderModals =
    stack &&
    stack.map(({ status, key, type, error, modalProps }, idx) => {
      const ModalComponent = allModals[type];
      if (!ModalComponent) {
        return null;
      }
      return (
        <ModalWrapper handleClose={handleClose} key={idx}>
          <ModalComponent
            modalProps={modalProps}
            {...handlers}
            key={key + '-' + idx}
          />
        </ModalWrapper>
      );
    });

  return <>{renderModals}</>;
}

export default ModalManager;
