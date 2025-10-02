#!/usr/bin/env python3
"""
Astrals Hub - Video Downloader Helper
This script helps you set up a sample space video for your splash screen.
"""

import os
from pathlib import Path

def create_videos_folder():
    """Create the videos folder if it doesn't exist"""
    videos_dir = Path("static/videos")
    videos_dir.mkdir(parents=True, exist_ok=True)
    print(f"✅ Videos folder created: {videos_dir}")
    return videos_dir

def setup_video_folder():
    """Set up the video folder and provide instructions"""
    videos_dir = create_videos_folder()
    
    print("🎬 Sample Video Downloader")
    print("=" * 40)
    print()
    print("To add a video to your splash screen:")
    print("1. Find a space-themed video (3-5 seconds)")
    print("2. Download it and rename to 'splash-video.mp4'")
    print("3. Place it in: static/videos/")
    print()
    print("Recommended sources:")
    print("• Pixabay: https://pixabay.com/videos/search/space/")
    print("• Pexels: https://www.pexels.com/search/videos/space/")
    print("• NASA: https://www.nasa.gov/multimedia/videogallery/")
    print()
    print("Video requirements:")
    print("• Duration: 3-5 seconds (will loop)")
    print("• Resolution: 1920x1080 or higher")
    print("• File size: Under 5MB")
    print("• Format: MP4 (H.264)")
    print()
    
    # Check if video already exists
    video_path = videos_dir / "splash-video.mp4"
    if video_path.exists():
        print(f"✅ Video already exists: {video_path}")
        print("Your splash screen is ready to use!")
    else:
        print(f"📁 Place your video file here: {video_path}")
        print("After adding the video, run your Flask app to see it!")

if __name__ == "__main__":
    setup_video_folder()
