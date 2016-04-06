@echo on

xcopy /y/e/s www \\192.168.0.230\wwwroot\mobileapp-wh\demo\www
copy /y index.html \\192.168.0.230\wwwroot\mobileapp-wh\demo
copy /y update.json \\192.168.0.230\wwwroot\mobileapp-wh
copy /y WMS.apk \\192.168.0.230\wwwroot\mobileapp-wh\WMS-CBG.apk
del WMS.apk /f /q

pause 