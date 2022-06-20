import React from "react"

interface YTPlayerProps {
  setPlayerInstance(player: YT.Player): void;
  setPlayerState(state: number): void;
  startInterval(): void;
}
interface YTPlayerState {

}

interface Window {
  onYouTubeIframeAPIReady(): void;
}
declare var window: Window;

export class YTPlayer extends React.Component<YTPlayerProps, YTPlayerState> {
  constructor(props) {
    super(props);

    this.loadVideo = this.loadVideo.bind(this);
    this.onPlayerStateChange = this.onPlayerStateChange.bind(this);
  }

  componentDidMount() {
    if (document.getElementById('iframe_api') === null) {
      let tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      let firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = this.loadVideo;
    } else {
      this.loadVideo();
    }
  }

  loadVideo() {
    const player = new YT.Player('ytplayer', {
      events: {
        'onStateChange': this.onPlayerStateChange
      }
    });
    this.props.setPlayerInstance(player);
    this.props.startInterval();
  }

  onPlayerStateChange(event) {
    this.props.setPlayerState(event.data);
  }

  render() {
    return (
      <div id="ytwrapper">
        <div id="ytplayer"></div>
      </div>
    );
  }
}
