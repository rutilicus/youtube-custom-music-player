# youtube-custom-music-player
youtube-custom-music-player is a framework for creating music player like interface of songs sang in singing (karaoke) streamings.
This framework has only static resources, so you can deploy it to static sites.

## How to use
Download a zip file from Releases.
And edit files in data directory.
- config.json is a configuration file.
    - siteName is a site name.
    - userPlayList is a functionality switch of user play lists. If multiple sites exists in the same domain, the lists are shared.
- song_list.csv is a data file of streaming and sing informations.

These files must be edited by UTF-8.

Then, deploy these files on the web server.

## Caution
This framework uses HTTP requests for data, so this works only web server envirionment.

## Other
This framework is based on [uisetlist](https://github.com/rutilicus/uisetlist).
