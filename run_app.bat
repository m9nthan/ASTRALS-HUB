@echo off
REM Activate virtual environment (if exists)
IF EXIST venv (
    call venv\Scripts\activate
)

REM Install dependencies
pip install -r requirements.txt

REM Run the app
python run.py

pause
