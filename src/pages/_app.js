import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import notistackConfig from '@/modules/Notificator/notistackConfig';
import wrapper from '@/src/redux/store';
import ModalManager from '@/modules/Modal';
import Notifier from '@/modules/Notificator';

function MyApp({ Component, pageProps }) {
  console.log('_APP', { pageProps });
  return (
    <>
      <SnackbarProvider {...notistackConfig}>
        <CssBaseline />
        <ModalManager />
        <Notifier />
        <Component {...pageProps} />
      </SnackbarProvider>
    </>
  );
}

export default wrapper.withRedux(MyApp);
