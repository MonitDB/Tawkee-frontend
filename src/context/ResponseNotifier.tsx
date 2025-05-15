// components/HttpResponseNotifier.tsx
import { createContext, useContext, useState, ReactNode } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

type HttpResponseContextType = {
  notify: (message: string, severity?: AlertColor) => void;
};

const HttpResponseContext = createContext<HttpResponseContextType | undefined>(
  undefined
);

export const useHttpResponse = () => {
  const context = useContext(HttpResponseContext);
  if (!context)
    throw new Error('useHttpResponse must be used within HttpResponseProvider');
  return context;
};

export function HttpResponseProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertColor>('info');

  const notify = (msg: string, sev: AlertColor = 'info') => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  return (
    <HttpResponseContext.Provider value={{ notify }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={5000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </HttpResponseContext.Provider>
  );
}
