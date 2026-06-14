@echo off
echo Starting TrendSepetiX Servers...

:: Try to start Docker containers if they exist
echo Checking and starting Docker containers...
docker start trend_mysql >nul 2>&1
docker start trendsepetix-web-1 >nul 2>&1

:: Start local Django backend (will run if Docker container is not using port 8000)
start cmd /k "echo Django Backend Server starting... && title TrendSepetiX Backend && venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000"

:: Start React frontend dev server
start cmd /k "echo React Frontend Server starting... && title TrendSepetiX Frontend && cd frontend && npm run dev -- --host 127.0.0.1"

:: Wait 3 seconds for servers to start
echo Waiting for servers to initialize...
timeout /t 3 /nobreak >nul

:: Automatically open the Django web application in the default browser
echo Opening TrendSepetiX Web Application in browser...
start http://127.0.0.1:8000/

echo Done! Both servers have been started and the website is opened.
