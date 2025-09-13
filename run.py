#!/usr/bin/env python3
"""
AI Study Buddy - Simple Launcher
Run this to start your AI Study Buddy website!
"""

import webbrowser
import time
import sys
import os

def main():
    print("🤖 AI Study Buddy - Starting up...")
    print("=" * 50)
    
    # Check if Flask is installed
    try:
        import flask
        print("✅ Flask is installed!")
    except ImportError:
        print("❌ Flask is not installed!")
        print("Please run: pip install -r requirements.txt")
        return
    
    print("🚀 Starting Flask server...")
    print("📡 Server will be available at: http://localhost:5000")
    print("🌐 Opening browser in 3 seconds...")
    print("=" * 50)
    
    # Wait a moment then open browser
    time.sleep(9)
    webbrowser.open('http://localhost:5000')
    
    # Start Flask app
    try:
        from app import app
        app.run(debug=True, host='0.0.0.0', port=5000)
    except KeyboardInterrupt:
        print("\n👋 Shutting down AI Study Buddy...")
        print("Thank you for using AI Study Buddy!")
    except Exception as e:
        print(f"❌ Error starting application: {e}")

if __name__ == "__main__":
    main()
