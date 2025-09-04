import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Stack,
} from '@mui/material';
import { 
  ContentCopy as CopyIcon, 
  Launch as LaunchIcon,
  Add as AddIcon,
  Delete as DeleteIcon 
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { addUrl, updateExpirationStatus } from '../store/slices/urlsSlice';
import { ShortenedUrl } from '../store/slices/urlsSlice';
import { logger } from '../utils/logger';
import { generateShortCode, isValidUrl, isValidShortCode, formatDateTime } from '../utils/urlUtils';

const ShortenPage: React.FC = () => {
  const dispatch = useDispatch();
  const urls = useSelector((state: RootState) => state.urls.urls);
  
  const [forms, setForms] = useState([{
    id: Date.now(),
    originalUrl: '',
    customShortCode: '',
    validityMinutes: 30,
  }]);
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  const activeUrls = urls.filter(url => !url.isExpired);

  useEffect(() => {
    dispatch(updateExpirationStatus());
    const interval = setInterval(() => {
      dispatch(updateExpirationStatus());
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [dispatch]);

  const addForm = () => {
    if (forms.length < 5) {
      setForms([...forms, {
        id: Date.now(),
        originalUrl: '',
        customShortCode: '',
        validityMinutes: 30,
      }]);
      logger.info('Added new URL form');
    } else {
      showSnackbar('Maximum 5 URLs can be shortened concurrently', 'warning');
    }
  };

  const removeForm = (id: number) => {
    if (forms.length > 1) {
      setForms(forms.filter(form => form.id !== id));
      logger.info('Removed URL form', { formId: id });
    }
  };

  const updateForm = (id: number, field: string, value: string | number) => {
    setForms(forms.map(form => 
      form.id === id ? { ...form, [field]: value } : form
    ));
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const validateForm = (form: typeof forms[0]) => {
    if (!form.originalUrl) {
      return 'Original URL is required';
    }
    
    if (!isValidUrl(form.originalUrl)) {
      return 'Please enter a valid URL';
    }
    
    if (form.validityMinutes <= 0 || form.validityMinutes > 10080) { // Max 1 week
      return 'Validity must be between 1 and 10080 minutes (1 week)';
    }
    
    if (form.customShortCode && !isValidShortCode(form.customShortCode)) {
      return 'Short code must be 3-20 alphanumeric characters';
    }
    
    if (form.customShortCode && urls.some(url => url.shortCode === form.customShortCode)) {
      return 'This short code is already taken';
    }
    
    return null;
  };

  const handleSubmit = (formId: number) => {
    const form = forms.find(f => f.id === formId);
    if (!form) return;

    const error = validateForm(form);
    if (error) {
      showSnackbar(error, 'error');
      logger.error('URL validation failed', { error, form });
      return;
    }

    const shortCode = form.customShortCode || generateShortCode();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + form.validityMinutes * 60000);
    
    const shortenedUrl: ShortenedUrl = {
      id: Date.now().toString(),
      originalUrl: form.originalUrl,
      shortCode,
      shortenedUrl: `http://localhost:3000/${shortCode}`,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      clicks: [],
      isExpired: false,
    };

    dispatch(addUrl(shortenedUrl));
    logger.success('URL shortened successfully', { shortenedUrl });
    showSnackbar('URL shortened successfully!', 'success');

    // Clear the form
    updateForm(formId, 'originalUrl', '');
    updateForm(formId, 'customShortCode', '');
    updateForm(formId, 'validityMinutes', 30);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showSnackbar('Copied to clipboard!', 'success');
      logger.info('URL copied to clipboard', { url: text });
    }).catch(() => {
      showSnackbar('Failed to copy to clipboard', 'error');
      logger.error('Failed to copy to clipboard', { url: text });
    });
  };

  const openUrl = (url: string) => {
    window.open(url, '_blank');
    logger.info('URL opened in new tab', { url });
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        URL Shortener
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Shorten your URLs and track their analytics. You can create up to 5 shortened URLs at once.
      </Typography>

      {/* URL Forms */}
      <Stack spacing={3}>
        {forms.map((form, index) => (
          <Card key={form.id}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  URL #{index + 1}
                </Typography>
                {forms.length > 1 && (
                  <IconButton 
                    color="error" 
                    onClick={() => removeForm(form.id)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-end">
                <TextField
                  fullWidth
                  label="Original URL"
                  placeholder="https://example.com/very-long-url"
                  value={form.originalUrl}
                  onChange={(e) => updateForm(form.id, 'originalUrl', e.target.value)}
                  required
                  sx={{ flex: 3 }}
                />
                <TextField
                  label="Custom Short Code (Optional)"
                  placeholder="abc123"
                  value={form.customShortCode}
                  onChange={(e) => updateForm(form.id, 'customShortCode', e.target.value)}
                  helperText="3-20 alphanumeric characters"
                  sx={{ flex: 2 }}
                />
                <TextField
                  type="number"
                  label="Validity (minutes)"
                  value={form.validityMinutes}
                  onChange={(e) => updateForm(form.id, 'validityMinutes', parseInt(e.target.value) || 30)}
                  inputProps={{ min: 1, max: 10080 }}
                  sx={{ flex: 1, minWidth: 120 }}
                />
                <Button
                  variant="contained"
                  onClick={() => handleSubmit(form.id)}
                  sx={{ height: '56px', minWidth: 100 }}
                  disabled={!form.originalUrl}
                >
                  Shorten
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ))}

        {forms.length < 5 && (
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addForm}
            sx={{ py: 2 }}
          >
            Add Another URL ({forms.length}/5)
          </Button>
        )}
      </Stack>

      {/* Results Table */}
      {activeUrls.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Your Shortened URLs
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Shortened URL</TableCell>
                  <TableCell>Original URL</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Expires</TableCell>
                  <TableCell>Clicks</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activeUrls.map((url) => (
                  <TableRow key={url.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {url.shortenedUrl}
                        </Typography>
                        <Tooltip title="Copy to clipboard">
                          <IconButton 
                            size="small" 
                            onClick={() => copyToClipboard(url.shortenedUrl)}
                          >
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={url.originalUrl}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            maxWidth: 200, 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {url.originalUrl}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDateTime(url.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDateTime(url.expiresAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={url.clicks.length} 
                        size="small" 
                        color={url.clicks.length > 0 ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Open shortened URL">
                        <IconButton 
                          size="small" 
                          onClick={() => openUrl(url.shortenedUrl)}
                        >
                          <LaunchIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ShortenPage;