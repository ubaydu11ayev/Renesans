@echo off
title Renessans O'quv Markazi Boshqaruv Tizimi
color 0B
cls
echo ================================================================
echo    RENESSANS O'QUV MARKAZI BOSHQARUV TIZIMI
echo    "Sardoba language stars" MCHJ
echo ================================================================
echo.
echo Server va tizim komponentlari ishga tushirilmoqda...
echo.
echo Iltimos kuting, brauzeringiz avtomatik ochiladi...
echo.

start "" "http://localhost:5173"
call npm.cmd run start
pause

