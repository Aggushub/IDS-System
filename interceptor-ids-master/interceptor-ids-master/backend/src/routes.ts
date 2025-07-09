import express from 'express';
import { CowrieLog, BlockedIP } from './models';
import { transformCowrieLog, calculateStats } from './utils';

const router = express.Router();

// Get all logs
router.get('/api/logs', async (req, res) => {
  try {
    const logs = await CowrieLog.find().sort({ timestamp: -1 }).limit(1000);
    const transformedLogs = logs.map(transformCowrieLog);
    res.json(transformedLogs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Get stats
router.get('/api/stats', async (req, res) => {
  try {
    const logs = await CowrieLog.find().sort({ timestamp: -1 }).limit(1000);
    const transformedLogs = logs.map(transformCowrieLog);
    const stats = calculateStats(transformedLogs);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get blocked IPs (placeholder for now)
router.get('/api/blocked-ips', async (req, res) => {
  try {
    const blockedIPs = await BlockedIP.find();
    res.json(blockedIPs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blocked IPs' });
  }
});

// Basic auth endpoints (placeholder)
router.get('/api/auth/check', (req, res) => {
  res.json({ username: 'admin', role: 'admin' }); // Mock for now
});

router.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logged out' }); // Mock for now
});

export default router;
