import React from "react";
import { IdSongData } from "./types"
import { SongElem } from "./songelem"

interface SongListProps {
  songList?: IdSongData[];
  setSongIndex(listInedx: number): void;
}
interface SongListState {
}

export class SongList extends React.Component<SongListProps, SongListState> {

  constructor(props) {
    super(props);

    this.onSongElemClick = this.onSongElemClick.bind(this);
  }

  onSongElemClick(listIndex: number) {
    this.props.setSongIndex(listIndex);
  }

  render() {
    return(
      <div className="songList">
        { this.props.songList.length != 0 &&
          <div className="selectedList">
              {this.props.songList.map((song, index) => {
                return <div className="songElemWrapper">
                  <SongElem
                    key={index}
                    songData={song}
                    index={index}
                    onItemClickListener={this.onSongElemClick} />
                  </div>;
              })}
          </div>
        }
      </div>
    );
  }
}
