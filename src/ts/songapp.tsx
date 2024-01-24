import { IdSongData, NamedSongList, SongData, AppConfig, Spreadsheet, SpreadsheetValues } from "./types"
import { YTPlayer } from "./ytplayer"
import { SongList } from "./songlist"
import { ControlBar } from "./controlbar"
import { RepeatState } from "./constants"
import React from "react"
import ReactDOM from "react-dom"

interface SongAppProps {

}
interface SongAppState {
  songListList?: NamedSongList[];
  currentListIndex?: number;
  currentSong?: IdSongData;
  currentTime?: number;
  playerState?: number;
  isMuted?: boolean;
  repeatState?: RepeatState;
  userPlayList?: boolean;
  isVideoLoading?: VideoLoadingState;
}

const SEEK_PREV_TIME_THRES = 5;
const VIDEO_LOAD_TIME_EPS = 3;
type VideoLoadingState = "None" | "Loading" | "Seeking";

class SongApp extends React.Component<SongAppProps, SongAppState> {
  player: YT.Player;
  inervalId = 0;
  baseTitle = "";
  defaultSongIndex = -1;

  constructor(props) {
    super(props);

    this.setPlayerInstance = this.setPlayerInstance.bind(this);
    this.setSongIndex = this.setSongIndex.bind(this);
    this.onPlayerStateChange = this.onPlayerStateChange.bind(this);
    this.playVideo = this.playVideo.bind(this);
    this.pauseVideo = this.pauseVideo.bind(this);
    this.getPlayerState = this.getPlayerState.bind(this);
    this.startInterval = this.startInterval.bind(this);
    this.onPlayerReady = this.onPlayerReady.bind(this);
    this.mute = this.mute.bind(this);
    this.unMute = this.unMute.bind(this);
    this.advanceRepeatState = this.advanceRepeatState.bind(this);
    this.seekNext = this.seekNext.bind(this);
    this.seekNextForce = this.seekNextForce.bind(this);
    this.seekPrev = this.seekPrev.bind(this);
    this.seekTime = this.seekTime.bind(this);
    this.resetCurrentList = this.resetCurrentList.bind(this);
    this.setListIndex = this.setListIndex.bind(this);
    this.saveUserSongList = this.saveUserSongList.bind(this);
    this.createList = this.createList.bind(this);
    this.editCurrentListName = this.editCurrentListName.bind(this);
    this.deleteCurrentList = this.deleteCurrentList.bind(this);
    this.addSongToList = this.addSongToList.bind(this);
    this.deleteSongFromList = this.deleteSongFromList.bind(this);
    this.concatSongList = this.concatSongList.bind(this);
    this.shareLink = this.shareLink.bind(this);

    this.state = {
      songListList: [
        {name: "", songList: []}
      ],
      currentListIndex: 0,
      repeatState: RepeatState.REPEAT_NONE,
      currentTime: -1,
      isMuted: false,
      userPlayList: false,
      isVideoLoading: "None"
    };
  }

  saveUserSongList(list: NamedSongList[]) {
    // 先頭は全曲一覧のため、Trimしたものを保存
    localStorage.setItem("allSongList", JSON.stringify(list.slice(1)));
  }

  async componentDidMount(): Promise<void> {
    const configFetchRes = await fetch("./data/config.json");
    const configData = await configFetchRes.json() as AppConfig;

    /* Get Data From Spreadsheet. */
    const sheetFetchRes =
      await fetch("https://sheets.googleapis.com/v4/spreadsheets/"
                  + configData.spreadsheetId
                  + "?key=" + configData.apiKey);
    const sheetData = await sheetFetchRes.json() as Spreadsheet;
    const valuesFetchRes = 
      await fetch("https://sheets.googleapis.com/v4/spreadsheets/"
                  + configData.spreadsheetId + "/values/"
                  + sheetData.sheets[0].properties.title
                  + "?key=" + configData.apiKey);
    const values = await valuesFetchRes.json() as SpreadsheetValues;
    if (values.values.length <= 0) {
      /* Data Read Error. */
      return;
    }
    let movieIdCol = -1;
    let movieNameCol = -1;
    let startTimeCol = -1;
    let endTimeCol = -1;
    let songNameCol = -1;
    let artistCol = -1;
    for (let i = 0; i < values.values[0].length; i++) {
      switch (values.values[0][i]) {
        case "movieId":
          movieIdCol = i;
          break;
        case "movieName":
          movieNameCol = i;
          break;
        case "startTime":
          startTimeCol = i;
          break;
        case "endTime":
          endTimeCol = i;
          break;
        case "songName":
          songNameCol = i;
          break;
        case "artist":
          artistCol = i;
          break;
      }
    }
    if (movieIdCol == -1 || movieNameCol == -1 || startTimeCol == -1
        || endTimeCol == -1 || songNameCol == -1 || artistCol == -1) {
      /* Illegal Data. */
      return;
    }
    const maxUsedCol = Math.max(
      movieIdCol, movieNameCol, startTimeCol, endTimeCol, songNameCol, artistCol
    );
    let curId = 0;
    let idSongList = [] as IdSongData[];
    for (let i = 1; i < values.values.length; i++) {
      if (values.values[i].length < maxUsedCol) {
        /* Not Filled All Data. */
        continue;
      }
      idSongList.push({
        id: curId++,
        time: parseInt(values.values[i][startTimeCol]),
        endTime: parseInt(values.values[i][endTimeCol]),
        songName: values.values[i][songNameCol],
        artist: values.values[i][artistCol],
        movie: {
          movieId: values.values[i][movieIdCol],
          name: values.values[i][movieNameCol]
        }
      });
    }

    let songListList = [{
      name: "全曲一覧",
      songList: idSongList
    }];

    const userSongListJson = localStorage.getItem("allSongList");
    if (typeof userSongListJson === "string") {
      const parsed = JSON.parse(userSongListJson) as any[];
      parsed.forEach((songList) => {
        let typed = songList as NamedSongList;
        // 普通に使っていればIDが枯渇することはないが、一応振り直す
        for (let i = 0; i < typed.songList.length; i++) {
          typed.songList[i].id = i;
        }
        songListList.push(typed);
      });
      // ID振り直しがあるため一度保存する
      this.saveUserSongList(songListList);
    }

    this.setState({songListList: songListList});

    this.baseTitle = configData.siteName;
    document.title = configData.siteName;

    this.setState({userPlayList: configData.userPlayList});

    // URLパラメータによる指定があり、かつ妥当な文字列の場合は再生処理をする
    const params = new URLSearchParams(window.location.search);
    const paramId = params.get("id");
    if (paramId && paramId.length >= 12) {
      // YouTube 動画IDは11桁なので、時間と合わせて最低12桁の長さが必要
      const movieId = paramId.substring(0, 11);
      const time = parseInt(paramId.substring(11), 10) || -1;
      for (let i = 0; i < songListList[0].songList.length; i++) {
        const songData = songListList[0].songList[i];
        if (songData.movie.movieId == movieId && songData.time == time) {
          // YTPlayerのロードと本ロジックの処理のいずれが早く終わるか
          // 分からないためYTPlayerのonReadyとloadVideoByIdの
          // 両方で処理できるようにする
          this.setSongIndex(i);
          this.defaultSongIndex = i;
          break;
        }
      }
    }

    return Promise.resolve();
  }

  setPlayerInstance(player) {
    this.player = player;
  }

  onPlayerStateChange(state) {
    this.setState({
      playerState: state
    });
    if (this.player && this.state.currentSong
        && state == YT.PlayerState.PLAYING
        && this.state.isVideoLoading == "Loading") {
      // 動画読み込み後は現在の曲の開始位置にシークさせる
      this.player.seekTo(this.state.currentSong.time, true);
      this.setState({isVideoLoading: "Seeking"});
    }
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
    const newSong = this.state.songListList[this.state.currentListIndex].songList[listIndex];
    const isSameMovie =
      this.state.currentSong
      && this.state.currentSong.movie.movieId == newSong.movie.movieId;
    this.setState({
      currentTime: -1,
      currentSong: newSong
    });
    if (this.player && this.player.loadVideoById) {
      // loadVideoByIdのstartSeconds引数が意図しない動作となるため、
      // 同じ動画中はseekToで移動
      // 異なる動画の場合は動画読み込み後にseekToで移動させる
      if (isSameMovie && this.player.seekTo) {
        this.player.seekTo(newSong.time, true);
        this.setState({isVideoLoading: "Seeking"});
      } else {
        this.player.loadVideoById({
          videoId: newSong.movie.movieId,
          startSeconds: newSong.time
        });
        this.setState({isVideoLoading: "Loading"});
      }
    }

    document.title = newSong.songName + " - " + this.baseTitle;
  }

  getPlayerState() {
    if (this.player) {
      const currentTime = this.player.getCurrentTime ? this.player.getCurrentTime() : -1;
      this.setState({
        currentTime: currentTime,
        isMuted: this.player.isMuted && this.player.isMuted()
      });
      if (this.state.currentSong
          && this.state.playerState == YT.PlayerState.PLAYING) {
        if (this.state.isVideoLoading == "Seeking") {
          // タイミングによってはシークされていない場合があるため、
          // その場合は現時間と開始時間を比較して再度シーク指示を出す
          const timeDiff = currentTime - this.state.currentSong.time;
          if (0 <= timeDiff && timeDiff <= VIDEO_LOAD_TIME_EPS) {
            this.setState({isVideoLoading: "None"});
          } else {
            this.player.seekTo(this.state.currentSong.time, true);
          }
        } else if (this.state.isVideoLoading == "None"
                   && currentTime >= this.state.currentSong.endTime) {
          this.seekNext();
        }
      }
    }
  }

  startInterval() {
    this.inervalId = window.setInterval(this.getPlayerState, 500);
  }

  onPlayerReady() {
    if (this.defaultSongIndex != -1) {
      this.setSongIndex(this.defaultSongIndex);
    }
  }

  advanceRepeatState() {
    this.setState({
      repeatState: (this.state.repeatState + 1) % RepeatState.REPEAT_ALL_NUM
    });
  }

  seekNext() {
    const arrayIndex = this.state.songListList[this.state.currentListIndex].songList.findIndex(
      (idSongData) => idSongData.id === this.state.currentSong.id
    );
    const songNum = this.state.songListList[this.state.currentListIndex].songList.length;
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
    const arrayIndex = this.state.songListList[this.state.currentListIndex].songList.findIndex(
      (idSongData) => idSongData.id === this.state.currentSong.id
    );
    if (arrayIndex != -1) {
      if (this.state.repeatState === RepeatState.REPEAT_ONE) {
        if (arrayIndex + 1 < this.state.songListList[this.state.currentListIndex].songList.length) {
          this.setSongIndex(arrayIndex + 1);
        }
      } else {
        this.seekNext();
      }
    }
  }

  seekPrev() {
    const arrayIndex = this.state.songListList[this.state.currentListIndex].songList.findIndex(
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

  resetCurrentList(list: IdSongData[]) {
    let tmp = this.state.songListList.slice();
    tmp[this.state.currentListIndex].songList = list;
    this.setState({songListList: tmp});
    if (this.state.currentListIndex != 0) {
      this.saveUserSongList(tmp);
    }
  }

  setListIndex(index: number) {
    this.setState({currentListIndex: index});
  }

  createList(listName: string) {
    let tmp = this.state.songListList.slice();
    tmp.push({name: listName, songList: []});
    this.setState({songListList: tmp});
    this.saveUserSongList(tmp);
  }

  editCurrentListName(listName: string) {
    let tmp = this.state.songListList.slice();
    tmp[this.state.currentListIndex].name = listName;
    this.setState({songListList: tmp});
    this.saveUserSongList(tmp);
  }

  deleteCurrentList() {
    let tmp = this.state.songListList.slice();
    tmp.splice(this.state.currentListIndex, 1);
    this.setState({
      songListList: tmp,
      currentListIndex: 0
    });
    this.saveUserSongList(tmp);
  }

  addSongToList(listIndex: number, newSong: IdSongData) {
    let addElem = Object.assign({}, newSong);
    addElem.movie = Object.assign({}, newSong.movie);
    let tmp = this.state.songListList.slice();
    addElem.id =
      tmp[listIndex].songList.length ? 
      Math.max(...tmp[listIndex].songList.map((e) => e.id)) + 1 :
      0;
    tmp[listIndex].songList.push(addElem);
    this.setState({songListList: tmp});
    this.saveUserSongList(tmp);
  }

  deleteSongFromList(songIndex: number) {
    let tmp = this.state.songListList.slice();
    tmp[this.state.currentListIndex].songList.splice(songIndex, 1);
    this.setState({songListList: tmp});
    this.saveUserSongList(tmp);
  }

  concatSongList(list: NamedSongList[]) {
    let tmp = this.state.songListList.slice().concat(list);
    this.setState({songListList: tmp});
    this.saveUserSongList(tmp);
  }

  shareLink(data: SongData) {
    const shareData = {
      text: data.songName + " - " + this.baseTitle,
      url: location.protocol
           + "//" 
           + location.host 
           + location.pathname
           + "?id=" + data.movie.movieId + data.time
    };
    if (navigator.canShare && navigator.canShare(shareData)) {
      navigator.share(shareData).then(() => {});
    }
  }

  render() {
    return (
      <div>
        <main>
          <div className="playerMain">
            <YTPlayer
              setPlayerInstance={this.setPlayerInstance}
              onPlayerStateChange={this.onPlayerStateChange}
              startInterval={this.startInterval}
              onPlyaerReady={this.onPlayerReady}/>
            <SongList
              songListList={this.state.songListList}
              currentListIndex={this.state.currentListIndex}
              userPlayList={this.state.userPlayList}
              setSongIndex={this.setSongIndex}
              resetCurrentList={this.resetCurrentList}
              setListIndex={this.setListIndex}
              createList={this.createList}
              editCurrentListName={this.editCurrentListName}
              deleteCurrentList={this.deleteCurrentList}
              addSongToList={this.addSongToList}
              deleteSongFromList={this.deleteSongFromList}
              concatSongList={this.concatSongList}
              shareLink={this.shareLink}/>
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
            seekTime={this.seekTime}
            shareLink={this.shareLink}/>
        </main>
      </div>
    );
  }
}

ReactDOM.render(<SongApp />, document.getElementById("wrapper"));
