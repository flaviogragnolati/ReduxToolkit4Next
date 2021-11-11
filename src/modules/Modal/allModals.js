import { MODAL_TYPES } from '@/config/modalTypes';
import ConfirmationModal from '@/modules/Modal/components/ConfirmationModal';
import GenericModal from '@/modules/Modal/components/GenericModal';

const allModals = {
  [MODAL_TYPES.confirmationModal]: ConfirmationModal,
  [MODAL_TYPES.genericModal]: GenericModal,
};

export default allModals;
