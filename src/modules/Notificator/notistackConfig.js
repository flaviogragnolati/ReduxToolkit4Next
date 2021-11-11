import { Slide } from '@mui/material';

const notistackConfig = {
  dense: false,
  persist: false,
  autoHideDuration: 1000,
  maxSnack: 2,
  disableWindowBlurListener: false,
  preventDuplicate: true,
  TransitionComponent: Slide,
  anchorOrigin: {
    vertical: 'bottom',
    horizontal: 'center',
  },
  hideIconVariant: false,
};

export default notistackConfig;
