const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Schema & Model
const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['General User', 'Admin'], required: true },
    name: { type: String }
});
const User = mongoose.model('User', userSchema);

// MongoDB Atlas Connection
// Retrieves the connection string from your secure .env file
const atlasUri = process.env.MONGODB_URI;

if (!atlasUri) {
    console.error("FATAL ERROR: MONGODB_URI is not defined. Please create a .env file.");
    process.exit(1);
}

mongoose.connect(atlasUri, {
    serverSelectionTimeoutMS: 5000
}).then(async () => {
    console.log('MongoDB Atlas connected successfully.');
    // Seed initial admin if DB is empty
    const count = await User.countDocuments();
    if (count === 0) {
        await User.create({ userId: 'admin', password: 'password123', role: 'Admin', name: 'System Admin' });
        console.log('Default Admin user created (ID: admin / Password: password123)');
    }
}).catch(err => {
    console.error('Atlas Connection Error. Check your IP whitelist and database password.', err);
});

// 1. Auth Endpoint (With Delay Mechanism)
app.post('/api/login', (req, res) => {
    const { userId, password, role } = req.body;
    const delay = parseInt(req.query.delay) || 1000;

    setTimeout(async () => {
        try {
            const user = await User.findOne({ userId, password, role });
            if (user) {
                res.json({ success: true, user: { userId: user.userId, role: user.role, name: user.name } });
            } else {
                res.status(401).json({ success: false, message: 'Invalid credentials or role mismatch' });
            }
        } catch (error) {
            res.status(500).json({ success: false, message: 'Database error' });
        }
    }, delay);
});

// 2. Records Endpoint (Showcasing Access Levels & Async Processing)
app.get('/api/records', (req, res) => {
    const role = req.query.role;
    const delay = parseInt(req.query.delay) || 1000;

    setTimeout(() => {
        const records = role === 'Admin'
            ? [
                { id: 101, data: 'Financial Report Q3', access: 'Admin Only' },
                { id: 102, data: 'User Audit Logs', access: 'Admin Only' },
                { id: 103, data: 'Public Newsletter', access: 'General' }
            ]
            : [
                { id: 103, data: 'Public Newsletter', access: 'General' },
                { id: 104, data: 'Personal Profile Data', access: 'Restricted' }
            ];
        res.json({ success: true, records });
    }, delay);
});

// 3. User Management - Get All Users (Admin View)
app.get('/api/users', (req, res) => {
    const delay = parseInt(req.query.delay) || 1000;
    setTimeout(async () => {
        try {
            const users = await User.find({}, '-password'); // Exclude passwords from response
            res.json({ success: true, users });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Database error' });
        }
    }, delay);
});

// 4. User Management - Create New User
app.post('/api/users', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.json({ success: true, message: 'User created successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error creating user (duplicate ID?)' });
    }
});

// 5. User Management - Delete User
app.delete('/api/users/:userId', async (req, res) => {
    try {
        await User.findOneAndDelete({ userId: req.params.userId });
        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting user' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));