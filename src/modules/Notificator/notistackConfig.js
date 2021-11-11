import { Slide } from '@mui/material';

const notistackConfig = {
  dense: false,
  persist: false,
  autoHideDuration: 2000,
  maxSnack: 2,
  disableWindowBlurListener: false,
  preventDuplicate: true,
  TransitionComponent: Slide,
  anchorOrigin: {
    vertical: 'top',
    horizontal: 'center',
  },
  hideIconVariant: false,
};

export default notistackConfig;
