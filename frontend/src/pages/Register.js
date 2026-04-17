import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container, Box, TextField, Button, Typography,
  Paper, Alert, CircularProgress
} from '@mui/material';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Registration failed! Email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 10 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h4" align="center"
            sx={{ mb: 3, fontWeight: 'bold', color: '#1976d2' }}>
            📈 StockTrading
          </Typography>
          <Typography variant="h6" align="center" sx={{ mb: 3 }}>
            Create your account
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Full Name"
              value={name} onChange={(e) => setName(e.target.value)}
              sx={{ mb: 2 }} required
            />
            <TextField
              fullWidth label="Email" type="email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }} required
            />
            <TextField
              fullWidth label="Password" type="password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }} required
            />
            <Button fullWidth variant="contained" type="submit"
              size="large" disabled={loading}
              sx={{ mb: 2, py: 1.5 }}>
              {loading ? <CircularProgress size={24} /> : 'Register'}
            </Button>
          </form>
          <Typography align="center">
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#1976d2' }}>
              Login here
            </Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;