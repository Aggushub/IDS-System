import mongoose from 'mongoose';

// Raw Cowrie log schema (as stored in MongoDB)
const CowrieLogSchema = new mongoose.Schema({
  eventid: String,
  timestamp: String,
  src_ip: String,
  message: String,
  input: String,
  session: String,
  severity: String, // Present in real-time logs
}, { strict: false }); // Allow extra fields

export const CowrieLog = mongoose.model('Event', CowrieLogSchema, 'events');

// Blocked IP schema
const BlockedIPSchema = new mongoose.Schema({
  ip: { type: String, required: true, unique: true },
  reason: String,
  blockedAt: { type: Date, default: Date.now },
  expiresAt: Date,
  autoResponseId: String,
});

export const BlockedIP = mongoose.model('BlockedIP', BlockedIPSchema);
