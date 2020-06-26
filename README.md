# list-feeds a firefox/chrome webextension add-on

## Details:
https://addons.mozilla.org/en-US/firefox/addon/list-feeds/

## Usage:  
```
wget https://github.com/igorlogius/tbl2csv/archive/master.zip
unzip master.zip
zip -j "list-feeds-$(grep '"version"' list-feeds-master/src/manifest.json  | cut -d'"' -f4).xpi" ./list-feeds-master/src/*
```
Import list-feeds-x.y.z.zip into your browser (e.g. via `about:debugging`)
