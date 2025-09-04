import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { theme } from './theme/muiTheme';
import Layout from './components/Layout';
import ShortenPage from './pages/ShortenPage';
import StatsPage from './pages/StatsPage';
import RedirectPage from './pages/RedirectPage';
import { logger } from './utils/logger';

const App = () => {
  useEffect(() => {
    logger.info('Application started');
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<ShortenPage />} />
              <Route path="/shorten" element={<ShortenPage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/:shortcode" element={<RedirectPage />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
};

export default App;