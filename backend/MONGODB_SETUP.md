# MongoDB Setup Guide

Your system doesn't have MongoDB installed. Here are your options:

---

## ⚡ **Option 1: MongoDB Atlas (Cloud Database) - RECOMMENDED**

**Fastest and easiest option - No local installation needed!**

### Steps:

#### 1. Create Free MongoDB Atlas Account
- Go to: https://www.mongodb.com/cloud/atlas/register
- Sign up for free (no credit card required)
- Choose **FREE** M0 Shared cluster

#### 2. Create a Cluster
- Click "Build a Database"
- Select **FREE** Shared tier
- Choose your preferred region (closest to you)
- Click "Create Cluster" (takes 3-5 minutes)

#### 3. Create Database User
- Click "Database Access" in left sidebar
- Click "Add New Database User"
- Choose "Password" authentication
- Username: `lmsuser` (or any name)
- Password: Generate a secure password (save it!)
- User Privileges: "Atlas Admin" or "Read and write to any database"
- Click "Add User"

#### 4. Whitelist Your IP Address
- Click "Network Access" in left sidebar
- Click "Add IP Address"
- Click "Allow Access from Anywhere" (for testing)
- Or add your current IP address
- Click "Confirm"

#### 5. Get Connection String
- Go back to "Database" (left sidebar)
- Click "Connect" on your cluster
- Choose "Connect your application"
- Copy the connection string (looks like):
  ```
  mongodb+srv://lmsuser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
  ```

#### 6. Update Your .env File
Open `.env` file and replace the MONGODB_URI:

```env
# Replace this line:
MONGODB_URI=mongodb://localhost:27017/lms_database

# With your Atlas connection string:
MONGODB_URI=mongodb+srv://lmsuser:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/lms_database?retryWrites=true&w=majority
```

**Important:** Replace `YOUR_PASSWORD` with your actual password!

#### 7. Start Your Server
```bash
npm run dev
```

✅ **Done! Your API is now using MongoDB Atlas!**

---

## 🖥️ **Option 2: Install MongoDB Locally**

If you prefer to install MongoDB on your Windows machine:

### Steps:

#### 1. Download MongoDB Community Server
- Go to: https://www.mongodb.com/try/download/community
- Select:
  - Version: Latest (7.0 or higher)
  - Platform: Windows
  - Package: MSI
- Click "Download"

#### 2. Install MongoDB
- Run the downloaded MSI file
- Choose "Complete" installation
- **Important:** Check "Install MongoDB as a Service"
- **Important:** Check "Install MongoDB Compass" (GUI tool)
- Complete the installation

#### 3. Verify Installation
Open PowerShell and run:
```powershell
# Check if MongoDB service is running
Get-Service -Name MongoDB

# Try connecting (MongoDB 6.0+)
mongosh --version
```

#### 4. Start MongoDB Service (if not running)
```powershell
# Start MongoDB service
net start MongoDB
```

#### 5. Test Connection
```powershell
mongosh
```

If successful, you'll see:
```
Current Mongosh Log ID: ...
Connecting to: mongodb://127.0.0.1:27017
```

Type `exit` to quit.

#### 6. Your .env is Already Configured
The default `.env` file already has:
```env
MONGODB_URI=mongodb://localhost:27017/lms_database
```

#### 7. Start Your Server
```bash
npm run dev
```

✅ **Done!**

---

## 🐳 **Option 3: Docker (If you have Docker installed)**

If Docker is installed on your system:

### Quick Start:
```bash
# Run MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Verify it's running
docker ps
```

Your existing `.env` configuration will work!

---

## 🎯 **Which Option Should I Choose?**

| Option | Pros | Cons | Best For |
|--------|------|------|----------|
| **MongoDB Atlas** | ✅ No installation<br>✅ Free forever<br>✅ Automatic backups<br>✅ Works anywhere | ⚠️ Requires internet | **Recommended** - Quick start & Demo |
| **Local MongoDB** | ✅ Works offline<br>✅ Faster response | ⚠️ Installation required<br>⚠️ Manual setup | Production-like setup |
| **Docker** | ✅ Easy to start/stop<br>✅ No system install | ⚠️ Requires Docker | If Docker already installed |

---

## 🚀 **Recommended: MongoDB Atlas (Cloud)**

For your project showcase, **MongoDB Atlas is the best choice** because:
- ✅ No installation hassle
- ✅ Ready in 10 minutes
- ✅ Works from any network
- ✅ Perfect for demos
- ✅ Free forever (M0 tier)

---

## 📝 **After Setting Up MongoDB**

### 1. Test the Connection
Start your server:
```bash
npm run dev
```

You should see:
```
✅ Connected to MongoDB successfully
✅ LMS bank account initialized successfully
🚀 Server is running on port 5000
```

### 2. Seed the Database
```bash
node utils/seed.js
```

This creates sample data:
- 3 Instructors
- 2 Learners  
- 5 Courses
- LMS Bank Account

### 3. Test an Endpoint
```bash
curl http://localhost:5000/api/courses
```

Or open in browser: http://localhost:5000

---

## ❌ **Troubleshooting**

### "MongoNetworkError: connect ECONNREFUSED"
- **If using Atlas:** Check your connection string and password
- **If using Local:** Make sure MongoDB service is running

### "Authentication failed"
- **If using Atlas:** Verify username and password in connection string
- **If using Local:** Default local installation doesn't require auth

### "IP not whitelisted"
- **Atlas only:** Add your IP in Network Access settings

### "Cannot find module"
```bash
npm install
```

---

## 📞 **Need Help?**

### For MongoDB Atlas:
- Official Guide: https://www.mongodb.com/docs/atlas/getting-started/

### For Local Installation:
- Windows Guide: https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows/

### Test Your Setup:
After setting up, run:
```bash
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI || require('dotenv').config() && process.env.MONGODB_URI).then(() => console.log('✅ MongoDB Connected!')).catch(e => console.log('❌ Error:', e.message))"
```

---

## ⏱️ **Time Estimates**

- **MongoDB Atlas:** 10-15 minutes
- **Local Install:** 20-30 minutes
- **Docker:** 5 minutes (if Docker installed)

---

## 🎓 **Ready to Go!**

Once MongoDB is set up:
1. ✅ Update `.env` with connection string
2. ✅ Run `npm run dev`
3. ✅ Run `node utils/seed.js`
4. ✅ Test with Postman
5. ✅ You're ready for showcase!

---

**Recommended: Start with MongoDB Atlas for quickest setup! 🚀**
