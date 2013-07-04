#!/bin/bash
tools/deploy.sh
cp appinfo.json deploy/weather/
cd deploy
palm-package weather
palm-install com.chrismondok.weather_*
palm-launch com.chrismondok.weather
cd ..
