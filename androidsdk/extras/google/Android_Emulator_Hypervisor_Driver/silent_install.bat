@echo off

:: BatchGotAdmin
:-------------------------------------
REM  --> Check for permissions
net session >nul 2>&1

REM --> If error flag set, we do not have admin.
if ERRORLEVEL 1 (
    echo Requesting administrative privileges...
    goto UACPrompt
) else if NOT ERRORLEVEL 0 (
    echo Requesting administrative privileges...
    goto UACPrompt
) else ( goto gotAdmin )

:UACPrompt
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    set params= %*
    echo UAC.ShellExecute "cmd.exe", "/c ""%~s0"" %params:"=""%", "", "runas", 1 >> "%temp%\getadmin.vbs"

    CScript "%temp%\getadmin.vbs"
    del "%temp%\getadmin.vbs"
    exit /B

:gotAdmin
    pushd "%CD%"
    CD /D "%~dp0"
:--------------------------------------    

set action=install

:parse_input:
    if [%1] == [] (
        goto %action%
    )
    if [%1] == [-u] (
        set action=uninstall
        shift
        goto parse_input
    )
    if [%1] == [-v] (
        set action=checkinstall
        shift
        goto parse_input
    )

    REM Silently drop other parameters from haxm installer
    if [%1]==[-log] (
        shift
        shift
        goto parse_input
    )
    if [%1]==[-m] (
        shift
        shift
        goto parse_input
    )
    goto invalid_param
        

REM %ERRORLEVEL% seems not to be reliable and thus the extra work here
:install
    sc query gvm >nul 2>&1 || goto __install1
    sc stop gvm
    sc delete gvm
:__install1
    sc query aehd >nul 2>&1 || goto __install
    sc stop aehd
    sc delete aehd
:__install
    RUNDLL32.EXE SETUPAPI.DLL,InstallHinfSection DefaultInstall 132 .\aehd.Inf || exit /b 1
    sc start aehd
    exit /b 0

:uninstall
    sc query gvm >nul 2>&1 || goto __uninstall
    sc stop gvm
    sc delete gvm || exit /b 1
:__uninstall
    sc query aehd >nul 2>&1 || exit /b 0
    sc stop aehd
    sc delete aehd || exit /b 1
    exit /b 0

:checkinstall
    sc query aehd || exit /b 1
    exit /b 0

:invalid_param
    echo invalid parameter for %1
    exit /b 1
