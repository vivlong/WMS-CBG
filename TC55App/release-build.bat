@echo on

call cordova build --release android

pause 

cd platforms\android\build\outputs\apk

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ../../../../../my-release-key.keystore android-armv7-release-unsigned.apk alias_name

E:\Android\sdk\android-sdk\build-tools\22.0.1\zipalign.exe -v 4 android-armv7-release-unsigned.apk TC55App.apk

xcopy /y "%~dp0platforms\android\build\outputs\apk\TC55App.apk" "%~dp0"

del "%~dp0platforms\android\build\outputs\apk\TC55App.apk" /f /q

pause