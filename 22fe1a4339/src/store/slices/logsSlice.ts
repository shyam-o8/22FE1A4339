import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  data?: any;
}

interface LogsState {
  logs: LogEntry[];
}

const initialState: LogsState = {
  logs: [],
};

const logsSlice = createSlice({
  name: 'logs',
  initialState,
  reducers: {
    addLog: (state, action: PayloadAction<Omit<LogEntry, 'id' | 'timestamp'>>) => {
      const logEntry: LogEntry = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        ...action.payload,
      };
      state.logs.unshift(logEntry);
      
      // Keep only last 1000 logs
      if (state.logs.length > 1000) {
        state.logs = state.logs.slice(0, 1000);
      }

      // Persist to localStorage
      try {
        localStorage.setItem('appLogs', JSON.stringify(state.logs.slice(0, 100))); // Store only last 100
      } catch (error) {
        console.error('Error saving logs to localStorage:', error);
      }
    },
    loadLogs: (state) => {
      try {
        const stored = localStorage.getItem('appLogs');
        if (stored) {
          state.logs = JSON.parse(stored);
        }
      } catch (error) {
        console.error('Error loading logs from localStorage:', error);
      }
    },
    clearLogs: (state) => {
      state.logs = [];
      localStorage.removeItem('appLogs');
    },
  },
});

export const { addLog, loadLogs, clearLogs } = logsSlice.actions;
export default logsSlice.reducer;
