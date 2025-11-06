import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';
import MapIcon from '@mui/icons-material/Map';
import { useAuthStore } from '../../stores/RootStore';

export const LoginForm = observer(() => {
  const authStore = useAuthStore();
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    authStore.login(apiKey);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Card sx={{ maxWidth: 500, width: '100%', m: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MapIcon /> Map Tracker
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Система відстеження об'єктів на карті
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="API Ключ"
              variant="outlined"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="test-api-key-123"
              disabled={authStore.isConnecting}
              sx={{ mb: 2 }}
              autoFocus
            />

            {authStore.error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {authStore.error}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={!apiKey.trim() || authStore.isConnecting}
              startIcon={
                authStore.isConnecting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <LoginIcon />
                )
              }
            >
              {authStore.isConnecting ? 'Підключення...' : 'Увійти'}
            </Button>
          </form>

          <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" component="div">
              <strong>Тестовий ключ:</strong> test-api-key-123
            </Typography>
            <Typography variant="caption" color="text.secondary" component="div">
              <strong>Статус:</strong> {authStore.statusText}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
});

