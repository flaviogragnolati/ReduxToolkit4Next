import CssBaseline from '@mui/material/CssBaseline';
import wrapper from '@/src/redux/store';

function MyApp({ Component, pageProps }) {
  console.log('_APP', { pageProps });
  return (
    <>
      <CssBaseline />
      <Component {...pageProps} />
    </>
  );
}

export default wrapper.withRedux(MyApp);
