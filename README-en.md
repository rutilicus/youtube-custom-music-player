# youtube-custom-music-player
youtube-custom-music-player is a framework for creating music player like interface of songs sang in singing (karaoke) streamings.
This framework has only static resources, so you can deploy it to static sites.

## Difference from Version1
Version2 gets data from Google spreadsheet. This makes it easy to co-edit the data.
But, the settings are difficult than [Version1](https://github.com/rutilicus/youtube-custom-music-player/tree/V1xx). Consider using the [Version1](https://github.com/rutilicus/youtube-custom-music-player/tree/V1xx).

## How to use
Download a zip file from Releases.
And edit config.json in data directory.
- siteName is a site name.
- userPlayList is a functionality switch of user play lists. If multiple sites exists in the same domain, the lists are shared.
- spreadsheetId is the ID of Google spreadsheet. Refer [here](https://developers.google.com/sheets/api/guides/concepts) for IDs. The referred spreadsheet must be shared. The requirements of spreadsheet are described later.
- apiKey is the APY Key of Google Cloud APIs. Generate API Key [here](https://console.cloud.google.com/apis/credentials). The Key should be restricted by URL and the usage should be Google Sheets API only.

These files must be edited by UTF-8.

Then, deploy these files on the web server.

## The requirements of spreadsheet
The first row is heading row containing below items.
- movieId: YouTube movie or streaming ID
- movieName: YouTube movie or streaming name
- startTime: Starting time of the song\[sec\]
- endTime: End time of the song\[sec\]
- songName: Song name
- artist: Artist name

## Caution
This framework uses HTTP requests for data, so this works only web server envirionment.
