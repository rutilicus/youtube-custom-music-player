[English version is here.](https://github.com/rutilicus/youtube-custom-music-player/blob/V1xx/README-en.md)

# youtube-custom-music-player
youtube-custom-music-playerはYouTubeの歌枠等配信を音楽プレーヤー風にまとめるフレームワークです。
静的リソースのみで完結するようにしており、Webアプリケーション構築の知識がなくても静的ページ公開の知識があれば利用できるようにしております。

## 使い方
Releasesよりzipファイルをダウンロードし、解凍後data配下のファイルをサンプルデータに倣い編集してください。
- config.jsonはJSON形式の設定ファイルです。
    - siteNameはサイト名の文字列です。
    - userPlayListはユーザ作成リストの機能有無を切り替えます。デフォルトは無効(false)です。同一ドメインで複数のサイトがある場合、リストは共有されます。
- song_list.csvは配信情報、および歌の情報を記載したCSV形式のデータファイルです。

いずれも編集時はUTF-8を文字コードとして編集してください。

編集後は全ファイルをWebサーバ上に配置してください。

## 注意事項
本フレームワークのデータ取得はHTTPリクエストを介して行われるため、Webサーバ上にファイルを配置した場合のみ動作いたします。

## デプロイ例
[こちら](https://github.com/rutilicus/youtube-custom-music-player-example)を参照してください。

## その他
本フレームワークは[uisetlist](https://github.com/rutilicus/uisetlist)をベースに作成されました。
