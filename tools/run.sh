#!/bin/bash
tools/deploy.sh
cp appinfo.json deploy/cumulus/
cd deploy
palm-package cumulus
palm-install com.chrismondok.cumulus_*
palm-launch com.chrismondok.cumulus
cd ..
