@echo on

copy /y WMS-CBG.apk \\192.168.0.230\wwwroot\mobileapp-wh-cbg
copy /y update.json \\192.168.0.230\wwwroot\mobileapp-wh-cbg

xcopy /y/e/s/t www \\192.168.0.230\wwwroot\mobileapp-wh-cbg\www

pause 