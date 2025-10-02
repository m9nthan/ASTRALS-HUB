@echo off
echo ========================================
echo   Astrals Hub - Sample Video Downloader
echo ========================================
echo.
echo This script will help you download a sample space video
echo for your splash screen.
echo.
echo Instructions:
echo 1. Visit: https://pixabay.com/videos/search/space/
echo 2. Download a free space video (3-5 seconds)
echo 3. Rename it to "splash-video.mp4"
echo 4. Place it in the "static\videos\" folder
echo.
echo Alternative: Use this direct link for a sample:
echo https://cdn.pixabay.com/vimeo/123456789/space-video.mp4
echo.
echo Press any key to open the videos folder...
pause >nul
explorer "static\videos"
echo.
echo After adding your video file, run your Flask app to see it in action!
echo.
pause

