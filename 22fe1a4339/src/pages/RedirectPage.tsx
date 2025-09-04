import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { Launch as LaunchIcon } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { addClick, updateExpirationStatus } from '../store/slices/urlsSlice';
import { logger } from '../utils/logger';
import { getLocationMock, getReferrer } from '../utils/urlUtils';

const RedirectPage: React.FC = () => {
  const { shortcode } = useParams<{ shortcode: string }>();
  const dispatch = useDispatch();
  const urls = useSelector((state: RootState) => state.urls.urls);
  const [redirecting, setRedirecting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shortcode) {
      setError('Invalid short code');
      setRedirecting(false);
      return;
    }

    // Update expiration status first
    dispatch(updateExpirationStatus());

    // Find the URL
    const url = urls.find(u => u.shortCode === shortcode);

    if (!url) {
      setError('Short URL not found');
      setRedirecting(false);
      logger.warning('Attempted access to non-existent short URL', { shortcode });
      return;
    }

    if (url.isExpired || new Date() > new Date(url.expiresAt)) {
      setError('This short URL has expired');
      setRedirecting(false);
      logger.warning('Attempted access to expired short URL', { shortcode, url });
      return;
    }

    // Log the click
    const clickData = {
      timestamp: new Date().toISOString(),
      referrer: getReferrer(),
      location: getLocationMock(),
    };

    dispatch(addClick({ shortCode: shortcode, click: clickData }));
    logger.info('URL click recorded', { shortcode, clickData });

    // Redirect after a short delay
    const timer = setTimeout(() => {
      window.location.href = url.originalUrl;
    }, 2000);

    return () => clearTimeout(timer);
  }, [shortcode, urls, dispatch]);

  const handleManualRedirect = () => {
    const url = urls.find(u => u.shortCode === shortcode);
    if (url && !url.isExpired) {
      window.open(url.originalUrl, '_blank');
    }
  };

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
        <Card sx={{ maxWidth: 500, width: '100%' }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
            <Typography variant="h5" gutterBottom>
              Oops! Something went wrong
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {error === 'Short URL not found' 
                ? 'The short URL you\'re looking for doesn\'t exist or may have been removed.'
                : error === 'This short URL has expired'
                ? 'This short URL has reached its expiration date and is no longer active.'
                : 'The short code provided is not valid.'
              }
            </Typography>
            <Button
              variant="contained"
              href="/shorten"
              sx={{ mt: 2 }}
            >
              Create New Short URL
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const url = urls.find(u => u.shortCode === shortcode);

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '60vh' 
    }}>
      <Card sx={{ maxWidth: 500, width: '100%' }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          {redirecting ? (
            <>
              <CircularProgress size={60} sx={{ mb: 3 }} />
              <Typography variant="h5" gutterBottom>
                Redirecting...
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                You will be redirected to the original URL in a moment.
              </Typography>
              {url && (
                <>
                  <Typography variant="body2" sx={{ 
                    fontFamily: 'monospace', 
                    backgroundColor: 'grey.100',
                    p: 2,
                    borderRadius: 1,
                    mb: 2,
                    wordBreak: 'break-all'
                  }}>
                    {url.originalUrl}
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<LaunchIcon />}
                    onClick={handleManualRedirect}
                  >
                    Click here if not redirected
                  </Button>
                </>
              )}
            </>
          ) : (
            <Typography variant="h6">
              Preparing redirect...
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default RedirectPage;