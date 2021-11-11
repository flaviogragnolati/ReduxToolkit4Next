import { useDispatch, useSelector } from 'react-redux';
import {
  confirmationModal,
  declineConfirmationModal,
  confirmConfirmationModal,
} from '@/modules/Modal/modalSlice';
import { lastModalSelector } from '@/modules/Modal/modalSelectors';

function useConfirmationModal() {
  const dispatch = useDispatch();
  const modalProps = useSelector(lastModalSelector);

  const getConfirmation = async (modalProps) => {
    const { payload } = await dispatch(confirmationModal(modalProps));
    return payload;
  };

  const confirm = () => {
    return dispatch(confirmConfirmationModal());
  };

  const decline = () => {
    return dispatch(declineConfirmationModal());
  };

  return {
    getConfirmation,
    confirm,
    decline,
    modalProps,
  };
}

export default useConfirmationModal;
