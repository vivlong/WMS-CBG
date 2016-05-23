@echo on
set target="\\192.168.0.230\wwwroot\app\wms\interglobo"
xcopy /y/e/s www %target%\www
copy /y index.html %target%
copy /y update.json %target%
copy /y WMS.apk %target%\WMS-SingleSN.apk
del WMS.apk /f /q

pause 