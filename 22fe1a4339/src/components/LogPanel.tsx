import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  Divider,
} from '@mui/material';
import { Close as CloseIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { clearLogs } from '../store/slices/logsSlice';
import { formatDateTime } from '../utils/urlUtils';

interface LogPanelProps {
  open: boolean;
  onClose: () => void;
}

const LogPanel: React.FC<LogPanelProps> = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const logs = useSelector((state: RootState) => state.logs.logs);

  const getChipColor = (level: string) => {
    switch (level) {
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'success': return 'success';
      case 'info': return 'info';
      default: return 'default';
    }
  };

  const handleClearLogs = () => {
    dispatch(clearLogs());
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100vw', sm: 500 },
          maxWidth: '100vw',
        },
      }}
    >
      <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Application Logs</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {logs.length} log entries
          </Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={handleClearLogs}
            disabled={logs.length === 0}
          >
            Clear All
          </Button>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {logs.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No logs available
            </Typography>
          ) : (
            <List dense>
              {logs.map((log) => (
                <ListItem key={log.id} sx={{ flexDirection: 'column', alignItems: 'flex-start', pb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, width: '100%' }}>
                    <Chip 
                      label={log.level.toUpperCase()} 
                      size="small" 
                      color={getChipColor(log.level)}
                      variant="filled"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {formatDateTime(log.timestamp)}
                    </Typography>
                  </Box>
                  <ListItemText 
                    primary={log.message}
                    secondary={log.data ? JSON.stringify(log.data, null, 2) : undefined}
                    secondaryTypographyProps={{
                      component: 'pre',
                      sx: { fontSize: '0.75rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }
                    }}
                  />
                  <Divider sx={{ width: '100%', mt: 1 }} />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default LogPanel;