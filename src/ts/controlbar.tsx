import React from "react";
import { SongData } from "./types";
import { RepeatState } from "./constants";

interface ControlBarProps {
  currentSong?: SongData;
  currentTime?: number;
  playerState?: number;
  isMuted?: boolean;
  repeatState: RepeatState;
  playVideo(): void;
  pauseVideo(): void;
  mute(): void;
  unMute(): void;
  advanceRepeatState(): void;
  seekPrev(): void;
  seekNext(): void;
  seekTime(time: number): void;
}
interface ControlBarState {

}

export class ControlBar extends React.Component<ControlBarProps, ControlBarState> {
  constructor(props) {
    super(props);

    this.advanceRepeatState = this.advanceRepeatState.bind(this);
    this.getTimeString = this.getTimeString.bind(this);
    this.getTimeInfo = this.getTimeInfo.bind(this);
    this.getZeroPaddedNum = this.getZeroPaddedNum.bind(this);
    this.onSeekBarChange = this.onSeekBarChange.bind(this);
  }

  advanceRepeatState() {
    this.props.advanceRepeatState();
  }

  getZeroPaddedNum(num: number): string {
    return ("00" + num).slice(-2);
  }

  getTimeString(time: number): string {
    let timeRounded = Math.floor(time);
    return this.getZeroPaddedNum(Math.floor(timeRounded / 60)) +
      ":" + this.getZeroPaddedNum(timeRounded % 60);
  }

  getTimeInfo(): string {
    return this.getTimeString(this.props.currentTime - this.props.currentSong.time) +
      " / " +
      this.getTimeString(this.props.currentSong.endTime - this.props.currentSong.time);
  }

  onSeekBarChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.props.seekTime(parseInt(e.target.value));
  }

  render() {
    return (
      <div className="playerFooter">
        {this.props.currentSong &&
          <input
            type="range"
            className="seekBar"
            min={this.props.currentSong.time}
            max={this.props.currentSong.endTime}
            value={this.props.currentTime}
            onChange={this.onSeekBarChange}></input>
        }
        {
          !this.props.currentSong &&
          <div className="seekBar"></div>
        }
        <div className="controlBar">
          <div className="controlIcons">
            <span
              className="material-icons"
              onClick={this.props.seekPrev}>skip_previous</span>
            {
              // プレーヤー未読み込み時は再生ボタンを暫定で表示
              typeof(YT) === "undefined" &&
              <span
                className="material-icons playButton"
                onClick={this.props.pauseVideo}>pause</span>
            }
            {
              typeof(YT) !== "undefined" &&
              typeof(YT.Player) !== "undefined" &&
              this.props.playerState === YT.PlayerState.PLAYING &&
              <span
                className="material-icons playButton"
                onClick={this.props.pauseVideo}>pause</span>
            }
            {
              typeof(YT) !== "undefined" &&
              typeof(YT.Player) !== "undefined" &&
              this.props.playerState !== YT.PlayerState.PLAYING &&
              <span
                className="material-icons playButton"
                onClick={this.props.playVideo}>play_arrow</span>
            }
            <span
              className="material-icons"
              onClick={this.props.seekNext}>skip_next</span>
          </div>
          {this.props.currentSong != undefined && this.props.currentTime != undefined &&
            this.props.currentSong.time <= this.props.currentTime &&
            this.props.currentTime <= this.props.currentSong.endTime &&
            <span className="timeInfo">
              {this.getTimeInfo()}
            </span>
          }
          {this.props.currentSong &&
            <div className="playSongInfo">
              <img
                className="thumbnail"
                src={`https://i.ytimg.com/vi/${this.props.currentSong.movie.movieId}/hqdefault.jpg`} />
              <div>
                <div className="songName">
                  {this.props.currentSong.songName}
                </div>
                <div>
                  <span className="artist">
                    {this.props.currentSong.artist}
                  </span>
                  {this.props.currentSong.artist &&
                    <span>・</span>
                  }
                  <span className="movieName">
                    {this.props.currentSong.movie.name}
                  </span>
                </div>
              </div>
            </div>
          }
          <div className="controlIcons controlRight">
            {this.props.isMuted &&
              <span
                className="material-icons"
                onClick={this.props.unMute}>volume_off</span>
            }
            {!this.props.isMuted &&
              <span
                className="material-icons"
                onClick={this.props.mute}>volume_up</span>
            }
            {this.props.repeatState === RepeatState.REPEAT_NONE &&
              <span
                className="material-icons disable"
                onClick={this.advanceRepeatState}>repeat</span>
            }
            {this.props.repeatState === RepeatState.REPEAT_ALL &&
              <span
                className="material-icons"
                onClick={this.advanceRepeatState}>repeat</span>
            }
            {this.props.repeatState === RepeatState.REPEAT_ONE &&
              <span
                className="material-icons"
                onClick={this.advanceRepeatState}>repeat_one</span>
            }
            {this.props.repeatState === RepeatState.REPEAT_RANDOM &&
              <span
                className="material-icons"
                onClick={this.advanceRepeatState}>shuffle</span>
            }
          </div>
        </div>
      </div>
    );
  }
}
