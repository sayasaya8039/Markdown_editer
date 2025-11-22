@echo off
echo ========================================
echo Markdown Editor - Building EXE file
echo ========================================
echo.

REM Check if PyInstaller is installed
python -c "import PyInstaller" 2>NUL
if %ERRORLEVEL% NEQ 0 (
    echo PyInstaller is not installed. Installing...
    pip install pyinstaller
)

echo.
echo Building executable...
echo.

REM Build with PyInstaller
pyinstaller --clean --noconfirm markdown_editor.spec

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Build completed successfully!
    echo ========================================
    echo.
    echo The executable file is located at:
    echo   dist\MarkdownEditor\markdown_editor.exe
    echo.
    echo You can copy the entire "dist\MarkdownEditor" folder
    echo to any Windows computer and run it without Python installed.
    echo.
) else (
    echo.
    echo ========================================
    echo Build failed!
    echo ========================================
    echo Please check the error messages above.
)

pause
