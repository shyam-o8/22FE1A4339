import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Alert,
  Stack,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import { Launch as LaunchIcon, ContentCopy as CopyIcon } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { updateExpirationStatus } from '../store/slices/urlsSlice';
import { formatDateTime } from '../utils/urlUtils';
import { logger } from '../utils/logger';

const StatsPage: React.FC = () => {
  const dispatch = useDispatch();
  const urls = useSelector((state: RootState) => state.urls.urls);

  useEffect(() => {
    dispatch(updateExpirationStatus());
    logger.info('Stats page loaded');
  }, [dispatch]);

  const totalUrls = urls.length;
  const activeUrls = urls.filter(url => !url.isExpired);
  const expiredUrls = urls.filter(url => url.isExpired);
  const totalClicks = urls.reduce((sum, url) => sum + url.clicks.length, 0);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      logger.info('URL copied to clipboard from stats', { url: text });
    }).catch(() => {
      logger.error('Failed to copy URL from stats', { url: text });
    });
  };

  const openUrl = (url: string) => {
    window.open(url, '_blank');
    logger.info('URL opened from stats', { url });
  };

  // Data for charts
  const statusData = [
    { name: 'Active', value: activeUrls.length, color: '#2e7d32' },
    { name: 'Expired', value: expiredUrls.length, color: '#d32f2f' },
  ];

  const clicksData = urls.map(url => ({
    shortCode: url.shortCode,
    clicks: url.clicks.length,
  })).sort((a, b) => b.clicks - a.clicks).slice(0, 10);

  // Columns for DataGrid
  const columns: GridColDef[] = [
    {
      field: 'shortCode',
      headerName: 'Short Code',
      width: 120,
      renderCell: (params) => (
        <Typography sx={{ fontFamily: 'monospace' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'shortenedUrl',
      headerName: 'Shortened URL',
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontFamily: 'monospace',
              maxWidth: 180,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {params.value}
          </Typography>
          <Tooltip title="Copy">
            <IconButton size="small" onClick={() => copyToClipboard(params.value)}>
              <CopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Open">
            <IconButton size="small" onClick={() => openUrl(params.value)}>
              <LaunchIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
    {
      field: 'originalUrl',
      headerName: 'Original URL',
      width: 300,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <Typography 
            variant="body2"
            sx={{ 
              maxWidth: 280,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {params.value}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 160,
      renderCell: (params) => (
        <Typography variant="body2">
          {formatDateTime(params.value)}
        </Typography>
      ),
    },
    {
      field: 'expiresAt',
      headerName: 'Expires',
      width: 160,
      renderCell: (params) => (
        <Typography variant="body2">
          {formatDateTime(params.value)}
        </Typography>
      ),
    },
    {
      field: 'clicks',
      headerName: 'Clicks',
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={params.value.length} 
          size="small"
          color={params.value.length > 0 ? 'primary' : 'default'}
        />
      ),
    },
    {
      field: 'isExpired',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip 
          label={params.value ? 'Expired' : 'Active'} 
          size="small"
          color={params.value ? 'error' : 'success'}
          variant="filled"
        />
      ),
    },
  ];

  const rows = urls.map(url => ({
    id: url.id,
    shortCode: url.shortCode,
    shortenedUrl: url.shortenedUrl,
    originalUrl: url.originalUrl,
    createdAt: url.createdAt,
    expiresAt: url.expiresAt,
    clicks: url.clicks,
    isExpired: url.isExpired,
  }));

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        URL Statistics
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Comprehensive analytics for all your shortened URLs.
      </Typography>

      {urls.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No URLs have been shortened yet. Visit the{' '}
          <Typography component="span" sx={{ fontWeight: 'bold' }}>
            Shorten URL
          </Typography>{' '}
          page to create your first shortened URL.
        </Alert>
      ) : (
        <Stack spacing={4}>
          {/* Overview Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3 }}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total URLs
                </Typography>
                <Typography variant="h4" component="div">
                  {totalUrls}
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Active URLs
                </Typography>
                <Typography variant="h4" component="div" color="success.main">
                  {activeUrls.length}
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Expired URLs
                </Typography>
                <Typography variant="h4" component="div" color="error.main">
                  {expiredUrls.length}
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Clicks
                </Typography>
                <Typography variant="h4" component="div" color="primary.main">
                  {totalClicks}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Charts */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  URL Status Distribution
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Top 10 Most Clicked URLs
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={clicksData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="shortCode" />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="clicks" fill="#1976d2" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* URLs Table */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                All URLs
              </Typography>
              <Box sx={{ height: 600, width: '100%' }}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  initialState={{
                    pagination: {
                      paginationModel: { pageSize: 10 },
                    },
                  }}
                  pageSizeOptions={[10, 25, 50]}
                  disableRowSelectionOnClick
                  sx={{
                    '& .MuiDataGrid-cell': {
                      padding: '8px',
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>

          {/* Click Details for URLs with clicks */}
          {urls.some(url => url.clicks.length > 0) && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Click Analytics
                </Typography>
                {urls.filter(url => url.clicks.length > 0).map(url => (
                  <Box key={url.id} sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {url.shortCode} ({url.clicks.length} clicks)
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Timestamp</TableCell>
                            <TableCell>Referrer</TableCell>
                            <TableCell>Location</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {url.clicks.map((click, index) => (
                            <TableRow key={index}>
                              <TableCell>{formatDateTime(click.timestamp)}</TableCell>
                              <TableCell>{click.referrer}</TableCell>
                              <TableCell>{click.location}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}
        </Stack>
      )}
    </Box>
  );
};

export default StatsPage;