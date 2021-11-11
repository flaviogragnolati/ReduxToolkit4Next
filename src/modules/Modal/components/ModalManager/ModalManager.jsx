import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ModalManager from '@/modules/Modal/components/ModalManager';
import { modalSelector } from '@/modules/Modal/modalSelectors';
import { closeModal } from '@/modules/Modal/modalSlice';
import allModals from '@/modules/Modal/allModals';

function ModalManager() {
  const dispatch = useDispatch();
  let { stack } = useSelector(modalSelector);

  const handleClose = () => {
    dispatch(closeModal());
  };

  const handlers = { handleClose };
  const renderModals = stack.map(
    ({ status, key, type, error, modalProps }, idx) => {
      const ModalComponent = allModals[type];
      if (!ModalComponent) {
        return null;
      }
      return (
        <ModalWrapper handleClose={handleClose}>
          <ModalComponent {...modalProps} {...handlers} key={key + '-' + idx} />
        </ModalWrapper>
      );
    }
  );

  return <>{renderModals}</>;
}

export default ModalManager;
