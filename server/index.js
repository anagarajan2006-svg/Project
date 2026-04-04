import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import otpGenerator from 'otp-generator';

import Voter from './models/Voter.js';
import Candidate from './models/Candidate.js';
import Vote from './models/Vote.js';
import Config from './models/Config.js';
import OTP from './models/OTP.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;

// 📂 Multer Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Initial Config
const initConfig = async () => {
    let config = await Config.findOne();
    if (!config) {
        config = new Config({ votingTime: { start: null, end: null, label: null }, resultsAnnounced: false });
        await config.save();
    }
    return config;
};

// --- OTP ROUTES ---

// POST /api/otp/send — generate & send OTP via Fast2SMS
app.post('/api/otp/send', async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone || phone.length < 10) {
            return res.status(400).json({ error: 'Invalid phone number.' });
        }

        // Generate 6-digit OTP
        const code = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        });

        // Save/update in MongoDB (valid for 5 mins)
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await OTP.findOneAndUpdate(
            { phone },
            { code, expiresAt },
            { upsert: true, new: true }
        );

        // Always log for testing
        console.log(`🔑 OTP for ${phone}: ${code}`);

        // Try sending via Fast2SMS
        const apiKey = process.env.FAST2SMS_API_KEY?.trim();
        if (apiKey) {
            try {
                const smsRes = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
                    params: {
                        authorization: apiKey,
                        route: 'otp',
                        variables_values: code,
                        numbers: phone
                    },
                    timeout: 8000
                });
                console.log('📱 SMS Response:', JSON.stringify(smsRes.data));
            } catch (smsErr) {
                console.error('⚠️ SMS send failed (OTP shown above for testing):', smsErr.response?.data || smsErr.message);
            }
        } else {
            console.warn('⚠️ No Fast2SMS key — OTP shown in console above for testing.');
        }

        res.json({ success: true, message: 'OTP Sent!' });
    } catch (err) {
        console.error('OTP send error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/otp/verify — verify OTP
app.post('/api/otp/verify', async (req, res) => {
    try {
        const { phone, code } = req.body;
        const record = await OTP.findOne({ phone, code });
        if (!record) return res.status(400).json({ error: 'Invalid OTP.' });
        if (record.expiresAt && new Date() > new Date(record.expiresAt)) {
            await OTP.deleteOne({ _id: record._id });
            return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
        }
        // Delete used OTP
        await OTP.deleteOne({ _id: record._id });
        res.json({ success: true, message: 'OTP verified!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- AUTH ROUTES ---

// Voter Register
// OTP is verified on the frontend via Firebase Phone Auth.
// We just check if the phone is not already registered and save the voter.
app.post('/api/voter/register', upload.single('photo'), async (req, res) => {
    try {
        const { voterId, name, phone, dob, gender, password } = req.body;

        const existingVoter = await Voter.findOne({ $or: [{ voterId }, { phone }] });
        if (existingVoter) return res.status(400).json({ error: 'Voter ID or phone number already registered.' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const photoPath = req.file ? `/uploads/${req.file.filename}` : '';

        const voter = new Voter({ 
            voterId, name, phone, dob, gender,
            photo: photoPath, 
            password: hashedPassword 
        });
        await voter.save();

        res.json({ message: 'Registration Successful!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Voter Login (Simplified for Phase 1 - Find Phone for OTP)
app.post('/api/voter/find-phone', async (req, res) => {
    try {
        const { voterId } = req.body;
        const voter = await Voter.findOne({ voterId });
        if (!voter) return res.status(404).json({ error: 'Voter ID not found.' });
        res.json({ phone: voter.phone });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Voter Login
// OTP is verified on the frontend via Firebase. Backend only verifies password.
app.post('/api/voter/login', async (req, res) => {
    try {
        const { voterId, password } = req.body;
        const voter = await Voter.findOne({ voterId });
        if (!voter) return res.status(404).json({ error: 'Voter ID not found.' });

        // Verify Password
        const isMatch = await bcrypt.compare(password, voter.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid password.' });

        const token = jwt.sign({ id: voter._id, role: 'voter' }, process.env.JWT_SECRET);
        res.json({ token, user: voter });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ELECTION ROUTES ---

// Candidate Register
app.post('/api/candidate/register', upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'flag', maxCount: 1 }]), async (req, res) => {
    try {
        const { name, partyName, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const photoPath = req.files['photo'] ? `/uploads/${req.files['photo'][0].filename}` : '';
        const flagPath = req.files['flag'] ? `/uploads/${req.files['flag'][0].filename}` : '';
        
        const candidate = new Candidate({ name, partyName, photo: photoPath, flag: flagPath, password: hashedPassword });
        await candidate.save();
        res.json({ message: 'Application Sent! Wait for admin approval.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Approved Candidates
app.get('/api/candidates', async (req, res) => {
    try {
        const candidates = await Candidate.find();
        res.json(candidates);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Cast Vote
app.post('/api/vote', async (req, res) => {
    try {
        const { voterId, partyName, password } = req.body;
        const voter = await Voter.findOne({ voterId });
        if (!voter) return res.status(404).json({ error: 'Voter not found' });
        
        const isMatch = await bcrypt.compare(password, voter.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid password' });

        if (voter.hasVoted) return res.status(400).json({ error: 'Already voted!' });

        const candidate = await Candidate.findOne({ partyName });
        const vote = new Vote({ voterId, candidateId: candidate._id, partyName });
        await vote.save();

        voter.hasVoted = true;
        await voter.save();

        res.json({ message: 'Vote Cast Successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ADMIN ROUTES ---

// Admin Login (Hardcoded as requested)
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'suvi' && password === '88888888') {
        const token = jwt.sign({ username, role: 'admin' }, process.env.JWT_SECRET);
        res.json({ token, user: { username, role: 'admin' } });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Update Party Status
app.put('/api/admin/party/status', async (req, res) => {
    try {
        const { id, status } = req.body;
        await Candidate.findByIdAndUpdate(id, { status });
        res.json({ message: 'Status Updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Election Config
app.get('/api/config', async (req, res) => {
    const config = await initConfig();
    res.json(config);
});

app.post('/api/admin/timer', async (req, res) => {
    try {
        const { days } = req.body;
        const start = new Date();
        const end = new Date();
        end.setDate(start.getDate() + days);
        await Config.findOneAndUpdate({}, { 
            votingTime: { 
                start: start.toISOString(), 
                end: end.toISOString(),
                label: `${days} Days`
            }
        });
        res.json({ message: 'Timer Set' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/announce', async (req, res) => {
    try {
        await Config.findOneAndUpdate({}, { resultsAnnounced: true });
        res.json({ message: 'Results Announced' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/votes', async (req, res) => {
    try {
        const votes = await Vote.find();
        res.json(votes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
