APPID	:= com.chrismondok.cumulus
VERSION	:= 0.1.$(shell git log --pretty=format:'' | wc -l )
IPK		:= $(APPID)_$(VERSION)_all.ipk

javascript := $(shell find source/ -type f -name '*.js')
css := $(shell find source/ -type f -name '*.css')
css := $(shell find source/ -type f -name '*.less')

deploy/cumulus: $(javascript) $(css) $(less) index.html
	./tools/deploy.sh

deploy/cumulus/appinfo.json: deploy/cumulus
	sed -e s/{VERSION}/$(VERSION)/ < appinfo.json > deploy/cumulus/appinfo.json

deploy/$(IPK): deploy/cumulus deploy/cumulus/appinfo.json
	palm-package -o deploy deploy/cumulus

webos: deploy/$(IPK)

install-webos: deploy/$(IPK)
	palm-install deploy/$(IPK)

run-webos: install-webos
	palm-launch $(APPID)

run-android: deploy/cumulus
	cd cordova; cordova run android;

clean:
	rm -rf deploy/* build/*
