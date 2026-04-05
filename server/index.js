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

import Voter from './models/Voter.js';
import Candidate from './models/Candidate.js';
import Vote from './models/Vote.js';
import Config from './models/Config.js';

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

// --- AUTH ROUTES ---

// Voter Register
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

// Voter Login
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

// Candidate Login
app.post('/api/candidate/login', async (req, res) => {
    try {
        const { nameOrParty, password } = req.body;
        const candidate = await Candidate.findOne({
            $or: [{ name: nameOrParty }, { partyName: nameOrParty }]
        });
        if (!candidate) return res.status(404).json({ error: 'Candidate/Party not found.' });
        if (candidate.status !== 'approved') return res.status(403).json({ error: 'Your party is not approved yet.' });

        const isMatch = await bcrypt.compare(password, candidate.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid password.' });

        const token = jwt.sign({ id: candidate._id, role: 'party' }, process.env.JWT_SECRET);
        res.json({ token, user: { ...candidate.toObject(), role: 'party' } });
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
    
    if (!config.resultsAnnounced && config.votingTime && config.votingTime.end) {
        if (new Date() > new Date(config.votingTime.end)) {
            config.resultsAnnounced = true;
            await config.save();
            console.log('🕒 Auto-announced results via config fetch.');
        }
    }

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

// Background loop to auto-announce results exactly when timer expires
setInterval(async () => {
    try {
        const config = await Config.findOne();
        if (config && !config.resultsAnnounced && config.votingTime && config.votingTime.end) {
            if (new Date() > new Date(config.votingTime.end)) {
                config.resultsAnnounced = true;
                await config.save();
                console.log('🕒 Voting time ended. Results have been automatically announced!');
            }
        }
    } catch (err) {
        // ignore errors in background loop
    }
}, 60000); // Check every minute

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
