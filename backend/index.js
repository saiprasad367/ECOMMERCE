const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

const adminAuthRoutes = require('./routes/adminAuth');
app.use('/api/admin', adminAuthRoutes);


app.use("/api/admin/products", require("./routes/adminProducts"));



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
