import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { store } from './store/store';
import { loadLogs } from './store/slices/logsSlice';

// Load persisted logs on app start
store.dispatch(loadLogs());

createRoot(document.getElementById("root")!).render(<App />);