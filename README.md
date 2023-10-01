[English version is here.](https://github.com/rutilicus/youtube-custom-music-player/blob/main/README-en.md)

# youtube-custom-music-player
youtube-custom-music-playerはYouTubeの歌枠等配信を音楽プレーヤー風にまとめるフレームワークです。
静的リソースのみで完結するようにしており、Webアプリケーション構築の知識がなくても静的ページ公開の知識があれば利用できるようにしております。

## 使い方
Releasesよりzipファイルをダウンロードし、解凍後data配下のconfig.jsonを編集してください。
- siteNameはサイト名の文字列です。
- userPlayListはユーザ作成リストの機能有無を切り替えます。デフォルトは無効(false)です。同一ドメインで複数のサイトがある場合、リストは共有されます。
- spreadsheetIdはGoogle スプレッドシートのIDです。IDについては[こちら](https://developers.google.com/sheets/api/guides/concepts)を参照してください。なお、参照するスプレッドシートは共有設定から公開されていなければなりません。
- apiKeyはGoogle Cloud APIsのAPI Keyです。[こちら](https://console.cloud.google.com/apis/credentials)からAPI Keyを発行してください。発行するAPI Keyは必ずURLによる制限とGoogle Sheets APIのみを使用するように制限してください。

いずれも編集時はUTF-8を文字コードとして編集してください。

編集後は全ファイルをWebサーバ上に配置してください。

## 注意事項
本フレームワークのデータ取得はHTTPリクエストを介して行われるため、Webサーバ上にファイルを配置した場合のみ動作いたします。
