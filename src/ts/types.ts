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

export type CsvData = Omit<SongData, "movie" | "time"> & Omit<Movie, "name"> & {
  startTime: number;
  movieName: string;
};
