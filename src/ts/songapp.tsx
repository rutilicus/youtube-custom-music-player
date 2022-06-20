import { IdSongData, CsvData } from "./types"
import { YTPlayer } from "./ytplayer"
import { SongList } from "./songlist"
import { ControlBar } from "./controlbar"
import { RepeatState } from "./constants"
import React from "react"
import ReactDOM from "react-dom"
import { parse } from "csv-parse/sync"

interface SongAppProps {

}
interface SongAppState {
  songList?: IdSongData[];
  currentSong?: IdSongData;
  currentTime?: number;
  playerState?: number;
  isMuted?: boolean;
  repeatState?: RepeatState;
  siteName?: string;
}

const SEEK_PREV_TIME_THRES = 5;

class SongApp extends React.Component<SongAppProps, SongAppState> {
  player: YT.Player;
  inervalId = 0;
  baseTitle = "";

  constructor(props) {
    super(props);

    this.setPlayerInstance = this.setPlayerInstance.bind(this);
    this.setSongIndex = this.setSongIndex.bind(this);
    this.setPlayerState = this.setPlayerState.bind(this);
    this.playVideo = this.playVideo.bind(this);
    this.pauseVideo = this.pauseVideo.bind(this);
    this.getPlayerState = this.getPlayerState.bind(this);
    this.startInterval = this.startInterval.bind(this);
    this.mute = this.mute.bind(this);
    this.unMute = this.unMute.bind(this);
    this.advanceRepeatState = this.advanceRepeatState.bind(this);
    this.seekNext = this.seekNext.bind(this);
    this.seekNextForce = this.seekNextForce.bind(this);
    this.seekPrev = this.seekPrev.bind(this);
    this.seekTime = this.seekTime.bind(this);

    this.state = {
      songList: [],
      repeatState: RepeatState.REPEAT_NONE,
      currentTime: -1,
      isMuted: false
    };
  }

  async componentDidMount(): Promise<void> {
    const csvFetchRes = await fetch("./data/song_list.csv");
    const csvData = await csvFetchRes.text();
    const records = parse(csvData, {columns: true}) as CsvData[];
    let idSongList = [] as IdSongData[];

    for (let i = 0; i < records.length; i++) {
      idSongList.push({
        id: i,
        time: records[i].startTime,
        endTime: records[i].endTime,
        songName: records[i].songName,
        artist: records[i].artist,
        movie: {
          movieId: records[i].movieId,
          name: records[i].movieName
        }
      });
    }

    this.setState({songList: idSongList});

    const configFetchRes = await fetch("./data/config.json");
    const configData = await configFetchRes.json() as {siteName: string};
    this.baseTitle = configData.siteName;
    document.title = configData.siteName;

    return Promise.resolve();
  }

  setPlayerInstance(player) {
    this.player = player;
  }

  setPlayerState(state) {
    this.setState({
      playerState: state
    });
  }

  playVideo() {
    this.player.playVideo();
  }

  pauseVideo() {
    this.player.pauseVideo();
  }

  mute() {
    this.player.mute();
  }

  unMute() {
    this.player.unMute();
  }

  setSongIndex(listIndex: number) {
    const newSong = this.state.songList[listIndex];
    this.setState({
      currentTime: -1,
      currentSong: newSong
    });
    this.player.loadVideoById({
      videoId: newSong.movie.movieId,
      startSeconds: newSong.time
    });

    document.title = newSong.songName + " - " + this.baseTitle;
  }

  getPlayerState() {
    if (this.player) {
      const currentTime = this.player.getCurrentTime ? this.player.getCurrentTime() : -1;
      this.setState({
        currentTime: currentTime,
        isMuted: this.player.isMuted && this.player.isMuted()
      });
      if (this.state.currentSong) {
        if (currentTime >= this.state.currentSong.endTime) {
          this.seekNext();
        }
      }
    }
  }

  startInterval() {
    this.inervalId = window.setInterval(this.getPlayerState, 500);
  }

  advanceRepeatState() {
    this.setState({
      repeatState: (this.state.repeatState + 1) % RepeatState.REPEAT_ALL_NUM
    });
  }

  seekNext() {
    const arrayIndex = this.state.songList.findIndex(
      (idSongData) => idSongData.id === this.state.currentSong.id
    );
    const songNum = this.state.songList.length;
    if (arrayIndex != -1) {
      switch(this.state.repeatState) {
        case RepeatState.REPEAT_NONE:
          if (arrayIndex + 1 < songNum) {
            this.setSongIndex(arrayIndex + 1);
          } else {
            // リスト終端での再生終了のため停止させる
            this.pauseVideo();
            document.title = this.baseTitle;
          }
          break;
        case RepeatState.REPEAT_ALL:
          if (arrayIndex + 1 < songNum) {
            this.setSongIndex(arrayIndex + 1);
          } else {
            this.setSongIndex(0);
          }
          break;
        case RepeatState.REPEAT_ONE:
          this.setSongIndex(arrayIndex);
          break;
        case RepeatState.REPEAT_RANDOM:
          this.setSongIndex(Math.floor(Math.random() * songNum));
          break
      }
    }
  }

  seekNextForce() {
    const arrayIndex = this.state.songList.findIndex(
      (idSongData) => idSongData.id === this.state.currentSong.id
    );
    if (arrayIndex != -1) {
      if (this.state.repeatState === RepeatState.REPEAT_ONE) {
        if (arrayIndex + 1 < this.state.songList.length) {
          this.setSongIndex(arrayIndex + 1);
        }
      } else {
        this.seekNext();
      }
    }
  }

  seekPrev() {
    const arrayIndex = this.state.songList.findIndex(
      (idSongData) => idSongData.id === this.state.currentSong.id
    );
    if (arrayIndex != -1) {
      if (this.state.currentTime - this.state.currentSong.time <= SEEK_PREV_TIME_THRES) {
        this.setSongIndex(Math.max(0, arrayIndex - 1));
      } else {
        this.setSongIndex(arrayIndex);
      }
    }
  }

  seekTime(time: number) {
    this.player.seekTo(time, true);
  }



  render() {
    return (
      <div>
        <main>
          <div className="playerMain">
            <YTPlayer
              setPlayerInstance={this.setPlayerInstance}
              setPlayerState={this.setPlayerState}
              startInterval={this.startInterval}/>
            <SongList
              songList={this.state.songList}
              setSongIndex={this.setSongIndex} />
          </div>
          <ControlBar
            currentSong={this.state.currentSong}
            currentTime={this.state.currentTime}
            playerState={this.state.playerState}
            isMuted={this.state.isMuted}
            repeatState={this.state.repeatState}
            playVideo={this.playVideo}
            pauseVideo={this.pauseVideo}
            mute={this.mute}
            unMute={this.unMute}
            advanceRepeatState={this.advanceRepeatState}
            seekPrev={this.seekPrev}
            seekNext={this.seekNextForce}
            seekTime={this.seekTime}/>
        </main>
      </div>
    );
  }
}

ReactDOM.render(<SongApp />, document.getElementById("wrapper"));
