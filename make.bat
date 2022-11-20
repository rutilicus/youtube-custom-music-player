call npx webpack
xcopy /e /y src\static build
type src\misc\LICENSE_APPEND.txt >> build\js\songapp_main.js.LICENSE.txt
