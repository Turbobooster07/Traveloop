@echo off
echo Starting Traveloop Application...

cd backend
echo Installing backend dependencies...
call npm install
echo Setting up database...
node setup_db.js
echo Starting backend server...
start npm run dev

cd ..\frontend
echo Installing frontend dependencies...
call npm install
echo Starting frontend dev server...
start npm run dev

echo Application is starting! 
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173 (usually)
pause
