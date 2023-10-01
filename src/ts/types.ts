export type Movie = {
  movieId: string;
  name: string;
};

export type SongData = {
  time: number;
  endTime: number;
  songName: string;
  artist: string;
  movie: Movie;
};

export type IdSongData = SongData & {
  id: number;
};

export type NamedSongList = {
  name: string;
  songList: IdSongData[];
};

export type AppConfig = {
  siteName: string;
  userPlayList: boolean;
  spreadsheetId: string;
  apiKey: string;
};

export type Spreadsheet = {
  sheets: {properties: {title: string}}[];
};

export type SpreadsheetValues = {
  values: [][];
}
