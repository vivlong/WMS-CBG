@echo on

xcopy /y/e/s/t www \\192.168.0.230\wwwroot\mobileapp-wh-cbg\www
copy /y index.html \\192.168.0.230\wwwroot\mobileapp-wh-cbg
copy /y update.json \\192.168.0.230\wwwroot\mobileapp-wh-cbg
copy /y WMS.apk \\192.168.0.230\wwwroot\mobileapp-wh-cbg\WMS-CBG.apk
del WMS.apk /f /q

pause 