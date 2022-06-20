import React from "react";
import { SongData } from "./types"

interface SongElemProps {
  songData: SongData
  index: number;
  onItemClickListener(index: number): void;
}
interface SongElemInterface {

}

export class SongElem extends React.Component<SongElemProps, SongElemInterface> {
  constructor(props) {
    super(props);

    this.handleItemClick = this.handleItemClick.bind(this);
  }
 
  handleItemClick(e: React.MouseEvent<HTMLInputElement>) {
    e.preventDefault();
    e.stopPropagation();
    this.props.onItemClickListener(this.props.index);
  }

  render() {
    return(
      <div className="songElem" onClick={this.handleItemClick}>
        <img
          className="thumbnail" 
          src={`https://i.ytimg.com/vi/${this.props.songData.movie.movieId}/hqdefault.jpg`} />
        <div className="songInfo">
          <div className="songName"> 
            {this.props.songData.songName}
          </div>
          <div className="artist"> 
            {this.props.songData.artist}
          </div>
        </div>
      </div>
    );
  }
}
