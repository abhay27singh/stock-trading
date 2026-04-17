import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import { AppBar, Toolbar, Typography, Button, Box, Chip } from '@mui/material';
import { Dashboard, ShowChart, Logout, AccountBalance, AdminPanelSettings } from '@mui/icons-material';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [navBalance, setNavBalance] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await userService.getProfile();
        setNavBalance(Number(res.data.balance) || 0);
      } catch {
        setNavBalance(0);
      }
    };
    fetchBalance();
    const interval = setInterval(fetchBalance, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };
  const isActive = (path) => location.pathname === path;

  return (
    <AppBar position="sticky" elevation={2}
      sx={{ background: 'linear-gradient(135deg, #1976d2, #1565c0)' }}>
      <Toolbar>
        <Typography variant="h6" fontWeight="bold" sx={{ cursor: 'pointer', mr: 4 }}
          onClick={() => navigate('/dashboard')}>
          📈 StockTrading
        </Typography>
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
          <Button color="inherit" startIcon={<Dashboard />} onClick={() => navigate('/dashboard')}
            sx={{ bgcolor: isActive('/dashboard') ? 'rgba(255,255,255,0.2)' : 'transparent', borderRadius: 2 }}>
            Dashboard
          </Button>
          <Button color="inherit" startIcon={<ShowChart />} onClick={() => navigate('/stocks')}
            sx={{ bgcolor: isActive('/stocks') ? 'rgba(255,255,255,0.2)' : 'transparent', borderRadius: 2 }}>
            Markets
          </Button>
          <Button color="inherit" startIcon={<AccountBalance />} onClick={() => navigate('/portfolio')}
            sx={{ bgcolor: isActive('/portfolio') ? 'rgba(255,255,255,0.2)' : 'transparent', borderRadius: 2 }}>
            Portfolio
          </Button>
          {isAdmin && (
            <Button color="inherit" startIcon={<AdminPanelSettings />} onClick={() => navigate('/admin')}
              sx={{ bgcolor: isActive('/admin') ? 'rgba(255,255,255,0.2)' : 'transparent', borderRadius: 2 }}>
              Admin
            </Button>
          )}
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <Chip
            label={`₹${Number(navBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }}
          />
          <Typography variant="body2" color="inherit">{user?.name}</Typography>
          <Button color="inherit" startIcon={<Logout />} onClick={handleLogout}>Logout</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
