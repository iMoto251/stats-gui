@ECHO OFF
git fetch
git pull
ECHO Starting app...
yarn start
PAUSE