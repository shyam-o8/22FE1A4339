import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UrlClick {
  timestamp: string;
  referrer: string;
  location: string;
}

export interface ShortenedUrl {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortenedUrl: string;
  createdAt: string;
  expiresAt: string;
  clicks: UrlClick[];
  isExpired: boolean;
}

interface UrlsState {
  urls: ShortenedUrl[];
}

const initialState: UrlsState = {
  urls: [],
};

// Load from localStorage
const loadFromStorage = (): ShortenedUrl[] => {
  try {
    const stored = localStorage.getItem('shortenedUrls');
    if (stored) {
      const urls = JSON.parse(stored);
      // Check expiration status
      return urls.map((url: ShortenedUrl) => ({
        ...url,
        isExpired: new Date() > new Date(url.expiresAt),
      }));
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error);
  }
  return [];
};

// Save to localStorage
const saveToStorage = (urls: ShortenedUrl[]) => {
  try {
    localStorage.setItem('shortenedUrls', JSON.stringify(urls));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

const urlsSlice = createSlice({
  name: 'urls',
  initialState: {
    ...initialState,
    urls: loadFromStorage(),
  },
  reducers: {
    addUrl: (state, action: PayloadAction<ShortenedUrl>) => {
      state.urls.push(action.payload);
      saveToStorage(state.urls);
    },
    addClick: (state, action: PayloadAction<{ shortCode: string; click: UrlClick }>) => {
      const url = state.urls.find(u => u.shortCode === action.payload.shortCode);
      if (url) {
        url.clicks.push(action.payload.click);
        saveToStorage(state.urls);
      }
    },
    updateExpirationStatus: (state) => {
      const now = new Date();
      state.urls.forEach(url => {
        url.isExpired = now > new Date(url.expiresAt);
      });
      saveToStorage(state.urls);
    },
  },
});

export const { addUrl, addClick, updateExpirationStatus } = urlsSlice.actions;
export default urlsSlice.reducer;