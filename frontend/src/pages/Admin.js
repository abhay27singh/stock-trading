import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import {
  Container, Paper, Typography, Box, Tabs, Tab, Button, TextField,
  CircularProgress, Chip, Alert, Snackbar, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import {
  People, TrendingUp, ShowChart, BarChart,
  Delete, Edit, Add,
} from '@mui/icons-material';

// ─── STATS TAB ───
const StatsTab = ({ stats }) => {
  if (!stats) return <CircularProgress />;

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, color: '#1976d2', icon: <People /> },
    { label: 'Total Stocks', value: stats.totalStocks, color: '#2e7d32', icon: <ShowChart /> },
    { label: 'Total Trades', value: stats.totalTransactions, color: '#7b1fa2', icon: <TrendingUp /> },
    { label: 'Trading Volume', value: `₹${Number(stats.totalVolume || 0).toLocaleString('en-IN')}`, color: '#e65100', icon: <BarChart /> },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
        {cards.map((card, i) => (
          <Paper key={i} elevation={3} sx={{
            p: 3, borderRadius: 3, flex: '1 1 200px', minWidth: 200,
            background: `linear-gradient(135deg, ${card.color}, ${card.color}cc)`,
          }}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Box sx={{ color: '#fff', opacity: 0.8 }}>{card.icon}</Box>
              <Box>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>{card.label}</Typography>
                <Typography variant="h5" fontWeight="bold" color="white">{card.value}</Typography>
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Paper elevation={2} sx={{ p: 3, borderRadius: 3, flex: '1 1 300px' }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Trade Breakdown</Typography>
          <Box display="flex" gap={3}>
            <Box>
              <Typography variant="body2" color="text.secondary">Buy Orders</Typography>
              <Typography variant="h4" fontWeight="bold" color="success.main">{stats.buyCount || 0}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Sell Orders</Typography>
              <Typography variant="h4" fontWeight="bold" color="error.main">{stats.sellCount || 0}</Typography>
            </Box>
          </Box>
        </Paper>

        <Paper elevation={2} sx={{ p: 3, borderRadius: 3, flex: '1 1 300px' }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Platform Overview</Typography>
          <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Total User Balances</Typography>
            <Typography variant="body2" fontWeight="bold">
              ₹{Number(stats.totalUserBalance || 0).toLocaleString('en-IN')}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">Most Traded Stock</Typography>
            <Chip label={stats.mostTradedStock || 'N/A'} size="small" color="primary" />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

// ─── USERS TAB ───
const UsersTab = ({ users, onRefresh, showSnackbar }) => {
  if (!users) return <CircularProgress />;

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}" and all their trades/portfolio? This cannot be undone.`)) return;
    try {
      await adminService.deleteUser(id);
      showSnackbar(`User ${name} deleted`, 'success');
      onRefresh();
    } catch (err) {
      showSnackbar(err.response?.data || 'Failed to delete user', 'error');
    }
  };

  return (
    <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Box sx={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              {['ID', 'Name', 'Email', 'Role', 'Balance', 'Stocks Owned', 'Joined', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '0.85rem', color: '#666' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(user => {
              const role = user.role || 'USER';
              return (
                <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px 16px' }}>{user.id}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{user.name}</td>
                  <td style={{ padding: '12px 16px' }}>{user.email}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <Chip label={role} size="small"
                      color={role === 'ADMIN' ? 'error' : 'primary'}
                      variant={role === 'ADMIN' ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 'bold' }} />
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                    ₹{Number(user.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '12px 16px' }}>{user.portfolioCount}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#888' }}>
                    {new Date(user.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {role !== 'ADMIN' && (
                      <IconButton size="small" color="error" onClick={() => handleDelete(user.id, user.name)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Box>
    </Paper>
  );
};

// ─── TRADES TAB ───
const TradesTab = ({ trades }) => {
  if (!trades) return <CircularProgress />;

  return (
    <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <Box sx={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              {['ID', 'User', 'Stock', 'Type', 'Qty', 'Price', 'Total', 'Date'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '0.85rem', color: '#666' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trades.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: '#999' }}>No trades yet</td></tr>
            ) : trades.map(trade => (
              <tr key={trade.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px 16px' }}>{trade.id}</td>
                <td style={{ padding: '12px 16px' }}>{trade.user?.name || trade.user?.email}</td>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                  {trade.stock?.symbol?.replace('.BSE', '')}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <Chip label={trade.type} size="small"
                    color={trade.type === 'BUY' ? 'success' : 'error'}
                    sx={{ fontWeight: 'bold' }} />
                </td>
                <td style={{ padding: '12px 16px' }}>{trade.quantity}</td>
                <td style={{ padding: '12px 16px' }}>₹{Number(trade.price).toLocaleString('en-IN')}</td>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                  ₹{Number(trade.total).toLocaleString('en-IN')}
                </td>
                <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: '#888' }}>
                  {new Date(trade.createdAt).toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Paper>
  );
};

// ─── STOCKS TAB ───
const StocksTab = ({ stocks, onRefresh, showSnackbar }) => {
  const [addOpen, setAddOpen] = useState(false);
  const [editStock, setEditStock] = useState(null);
  const [form, setForm] = useState({ symbol: '', companyName: '', currentPrice: '' });

  if (!stocks) return <CircularProgress />;

  const handleAdd = async () => {
    try {
      await adminService.addStock({
        symbol: form.symbol,
        companyName: form.companyName,
        currentPrice: Number(form.currentPrice),
      });
      showSnackbar('Stock added successfully', 'success');
      setAddOpen(false);
      setForm({ symbol: '', companyName: '', currentPrice: '' });
      onRefresh();
    } catch (err) {
      showSnackbar(err.response?.data || 'Failed to add stock', 'error');
    }
  };

  const handleEdit = async () => {
    try {
      await adminService.updateStock(editStock.id, {
        companyName: form.companyName,
        currentPrice: Number(form.currentPrice),
      });
      showSnackbar('Stock updated successfully', 'success');
      setEditStock(null);
      onRefresh();
    } catch (err) {
      showSnackbar(err.response?.data || 'Failed to update stock', 'error');
    }
  };

  const handleDelete = async (id, symbol) => {
    if (!window.confirm(`Delete ${symbol}? This cannot be undone.`)) return;
    try {
      await adminService.deleteStock(id);
      showSnackbar(`${symbol} deleted`, 'success');
      onRefresh();
    } catch (err) {
      showSnackbar(err.response?.data || 'Failed to delete stock', 'error');
    }
  };

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">Manage Stocks ({stocks.length})</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => {
          setForm({ symbol: '', companyName: '', currentPrice: '' });
          setAddOpen(true);
        }}>
          Add Stock
        </Button>
      </Box>

      <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                {['ID', 'Symbol', 'Company', 'Current Price', 'Change %', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '0.85rem', color: '#666' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stocks.map(stock => (
                <tr key={stock.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px 16px' }}>{stock.id}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{stock.symbol}</td>
                  <td style={{ padding: '12px 16px' }}>{stock.companyName}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                    ₹{Number(stock.currentPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <Chip
                      label={`${stock.changePercent >= 0 ? '+' : ''}${Number(stock.changePercent).toFixed(2)}%`}
                      size="small"
                      color={stock.changePercent >= 0 ? 'success' : 'error'}
                    />
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <IconButton size="small" color="primary" onClick={() => {
                      setEditStock(stock);
                      setForm({ symbol: stock.symbol, companyName: stock.companyName, currentPrice: stock.currentPrice });
                    }}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(stock.id, stock.symbol)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Paper>

      {/* Add Stock Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Stock</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Symbol (e.g. SBIN.BSE)" value={form.symbol}
            onChange={e => setForm(f => ({ ...f, symbol: e.target.value }))} sx={{ mt: 1, mb: 2 }} />
          <TextField fullWidth label="Company Name" value={form.companyName}
            onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} sx={{ mb: 2 }} />
          <TextField fullWidth label="Initial Price" type="number" value={form.currentPrice}
            onChange={e => setForm(f => ({ ...f, currentPrice: e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Stock Dialog */}
      <Dialog open={!!editStock} onClose={() => setEditStock(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit {editStock?.symbol}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Company Name" value={form.companyName}
            onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} sx={{ mt: 1, mb: 2 }} />
          <TextField fullWidth label="Price" type="number" value={form.currentPrice}
            onChange={e => setForm(f => ({ ...f, currentPrice: e.target.value }))} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditStock(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleEdit}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// ─── MAIN ADMIN PAGE ───
const Admin = () => {
  const [tab, setTab] = useState(0);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState(null);
  const [trades, setTrades] = useState(null);
  const [stocks, setStocks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message, severity) => setSnackbar({ open: true, message, severity });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, tradesRes, stocksRes] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(),
        adminService.getTrades(),
        adminService.getStocks(),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setTrades(tradesRes.data);
      setStocks(stocksRes.data);
    } catch (err) {
      console.error(err);
      showSnackbar('Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Admin Dashboard</Typography>
        <Button variant="outlined" onClick={fetchData}>Refresh</Button>
      </Box>

      <Paper elevation={1} sx={{ borderRadius: 3, mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth"
          sx={{ borderBottom: '1px solid #e0e0e0' }}>
          <Tab icon={<BarChart />} label="Statistics" iconPosition="start" />
          <Tab icon={<People />} label="Users" iconPosition="start" />
          <Tab icon={<TrendingUp />} label="Trades" iconPosition="start" />
          <Tab icon={<ShowChart />} label="Stocks" iconPosition="start" />
        </Tabs>
      </Paper>

      {tab === 0 && <StatsTab stats={stats} />}
      {tab === 1 && <UsersTab users={users} onRefresh={fetchData} showSnackbar={showSnackbar} />}
      {tab === 2 && <TradesTab trades={trades} />}
      {tab === 3 && <StocksTab stocks={stocks} onRefresh={fetchData} showSnackbar={showSnackbar} />}

      <Snackbar open={snackbar.open} autoHideDuration={3000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} variant="filled"
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Admin;
