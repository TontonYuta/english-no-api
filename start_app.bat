@echo off
chcp 65001 >nul
title PLAYENG STUDIO - PLAYWRIGHT CHATBOT AUTOMATION
color 0A
cls

echo ===============================================================================
echo        🎯 PLAYENG STUDIO - TỰ ĐỘNG HÓA HỌC TIẾNG ANH (NO API KEY)
echo ===============================================================================
echo.
echo [1/3] Đang kiểm tra môi trường Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [LỖI] Chưa tìm thấy Node.js! Vui lòng cài đặt Node.js từ https://nodejs.org
    echo.
    pause
    exit /b
)

echo [2/3] Đang kiểm tra thư viện dự án...
if not exist "node_modules\" (
    echo Đang cài đặt thư viện lần đầu (vui lòng chờ trong giây lát)...
    call npm install
)

echo.
echo [3/3] Đang khởi động hệ thống PlayEng Studio...
echo.
echo ===============================================================================
echo   🚀 HỆ THỐNG ĐÃ SẴN SÀNG TẠI: http://localhost:3000
echo   ✨ Điều khiển Playwright ➔ Gemini / ChatGPT Web ➔ Tự động bóc tách kết quả
echo ===============================================================================
echo.

start "" "http://localhost:3000"
npm run dev

pause
