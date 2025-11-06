import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { RootStoreContext, rootStore } from './stores/RootStore';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootStoreContext.Provider value={rootStore}>
      <App />
    </RootStoreContext.Provider>
  </StrictMode>
);
