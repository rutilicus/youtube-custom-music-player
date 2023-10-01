# youtube-custom-music-player
youtube-custom-music-player is a framework for creating music player like interface of songs sang in singing (karaoke) streamings.
This framework has only static resources, so you can deploy it to static sites.

## How to use
Download a zip file from Releases.
And edit config.json in data directory.
- siteName is a site name.
- userPlayList is a functionality switch of user play lists. If multiple sites exists in the same domain, the lists are shared.
- spreadsheetId is the ID of Google spreadsheet. Refer [here](https://developers.google.com/sheets/api/guides/concepts) for IDs. The referred spreadsheet must be shared.
- apiKey is the APY Key of Google Cloud APIs. Generate API Key [here](https://console.cloud.google.com/apis/credentials). The Key should be restricted by URL and the usage should be Google Sheets API only.

These files must be edited by UTF-8.

Then, deploy these files on the web server.

## Caution
This framework uses HTTP requests for data, so this works only web server envirionment.
