# 🤖 AI Study Buddy - Your Learning Companion

A modern, interactive web application that provides an AI-powered study companion for students.

## 🚀 Quick Start

### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Run the Application
```bash
python run.py
```

### Step 3: Open Your Browser
The application will automatically open at: http://localhost:5000

## ✨ Features

- **Interactive AI Chat** - Real-time conversation with AI tutor
- **Multi-Subject Support** - Mathematics, Science, English, History
- **Modern UI** - Beautiful, responsive design
- **Progress Tracking** - Monitor your learning progress
- **Chat History** - Save and review conversations

## 📁 Files Included

- `app.py` - Flask backend server
- `run.py` - Simple launcher script
- `requirements.txt` - Python dependencies
- `templates/index.html` - Main webpage
- `static/styles.css` - Styling
- `static/script.js` - Frontend functionality

## 🎓 How to Use

1. **Start the server** using `python run.py`
2. **Choose a subject** from the Subjects section
3. **Ask questions** about any topic
4. **Use quick actions** for common requests
5. **Track your progress** in the Profile section

## 🔧 Troubleshooting

**If you get "Module not found" errors:**
```bash
pip install flask flask-cors
```

**If port 5000 is busy:**
- Change the port in `app.py` (line 314)
- Or kill the process using port 5000

**If browser doesn't open:**
- Manually go to http://localhost:5000

---

**Happy Learning! 🎓✨**
