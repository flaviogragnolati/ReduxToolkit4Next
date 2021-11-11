import { MODAL_TYPES } from '@/common/config/modalTypes';
import ConfirmationModal from '@/modules/Modal/components/ConfirmationModal';

const allModals = {
  [MODAL_TYPES.confirmationModal]: ConfirmationModal,
};

export default allModals;
