import React from "react";
import { IdSongData, NamedSongList } from "./types"
import { SongElem } from "./songelem"
import { ReactSortable } from "react-sortablejs";
import Modal from "react-modal";

interface SongListProps {
  songListList?: NamedSongList[];
  currentListIndex?: number;
  userPlayList?: boolean;
  setSongIndex(listInedx: number): void;
  resetCurrentList(list: IdSongData[]): void;
  setListIndex(index: number): void;
  createList(listName: string): void;
  editCurrentListName(listName: string): void;
  deleteCurrentList(): void;
  addSongToList(listIndex: number, newSong: IdSongData): void;
  deleteSongFromList(songIndex: number): void;
  concatSongList(list: NamedSongList[]): void;
}
interface SongListState {
  listMenuClicked?: boolean;
  songMenuClicked?: boolean;
  songMenuClickedIndex?: number;
  modalState?: ModalState;
  editListName?: string;
  addListIndex?: number;
}

enum ModalState {
  MODAL_NONE,
  MODAL_CREATE,
  MODAL_RENAME,
  MODAL_DELETE,
  MODAL_ADD,
  MODAL_DELETE_ELEM,
}

const defaultDialogStyle: ReactModal.Styles = {
  overlay: {
    backgroundColor: "rgba(128, 128, 128, 0.75)"
  },
  content: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    border: "1px solid gray",
    padding: "0",
    width: "18rem",
    height: "6rem",
  }
}

export class SongList extends React.Component<SongListProps, SongListState> {

  constructor(props) {
    super(props);

    this.onSongElemClick = this.onSongElemClick.bind(this);
    this.onListSelected = this.onListSelected.bind(this);
    this.onSongElemMenuClick = this.onSongElemMenuClick.bind(this);
    this.onSongElemMenuRelease = this.onSongElemMenuRelease.bind(this);
    this.displayCreateDialog = this.displayCreateDialog.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.onListMenuClick = this.onListMenuClick.bind(this);
    this.onListMenuRelease = this.onListMenuRelease.bind(this);
    this.setEditListName = this.setEditListName.bind(this);
    this.createList = this.createList.bind(this);
    this.displayDeleteDialog = this.displayDeleteDialog.bind(this);
    this.displayRenameDialog = this.displayRenameDialog.bind(this);
    this.displayAddDialog = this.displayAddDialog.bind(this);
    this.displayDeleteElemDialog = this.displayDeleteElemDialog.bind(this);
    this.editListName = this.editListName.bind(this);
    this.deleteList = this.deleteList.bind(this);
    this.onAddListSelected = this.onAddListSelected.bind(this);
    this.addSong = this.addSong.bind(this);
    this.deleteSong = this.deleteSong.bind(this);
    this.exportUserList = this.exportUserList.bind(this);
    this.importUserList = this.importUserList.bind(this);
    this.fireImport = this.fireImport.bind(this);

    this.state = {
      listMenuClicked: false,
      songMenuClicked: false,
      songMenuClickedIndex: 0,
      modalState: ModalState.MODAL_NONE,
      editListName: "",
      addListIndex: 0
    }
  }

  onSongElemClick(listIndex: number) {
    this.props.setSongIndex(listIndex);
  }

  onListMenuClick() {
    this.setState({ listMenuClicked: true });
  }

  onListMenuRelease() {
    this.setState({ listMenuClicked: false });
  }

  onSongElemMenuClick(listIndex: number) {
    this.setState({
      songMenuClicked: true,
      songMenuClickedIndex: listIndex,
    });
  }

  onSongElemMenuRelease() {
    this.setState({songMenuClicked: false});
  }

  onListSelected(event: React.ChangeEvent<HTMLSelectElement>) {
    this.props.setListIndex(parseInt(event.target.value));
  }

  onAddListSelected(event: React.ChangeEvent<HTMLSelectElement>) {
    this.setState({ addListIndex: parseInt(event.target.value) });
  }

  displayCreateDialog() {
    this.setState({
      listMenuClicked: false,
      modalState: ModalState.MODAL_CREATE,
      editListName: ""
    });
  }

  displayDeleteDialog() {
    this.setState({
      listMenuClicked: false,
      modalState: ModalState.MODAL_DELETE
    });
  }

  displayRenameDialog() {
    this.setState({
      listMenuClicked: false,
      modalState: ModalState.MODAL_RENAME,
      editListName: this.props.songListList[this.props.currentListIndex].name
    });
  }

  displayAddDialog() {
    if (this.props.songListList.length <= 1) {
      // 全曲一覧しかない場合は新規にリストを作成してからダイアログ表示
      this.props.createList("New List");
    }
    this.setState({
      songMenuClicked: false,
      modalState: ModalState.MODAL_ADD,
      addListIndex: 0
    });
  }

  displayDeleteElemDialog() {
    this.setState({
      songMenuClicked: false,
      modalState: ModalState.MODAL_DELETE_ELEM,
    });
  }

  closeDialog() {
    this.setState({ modalState: ModalState.MODAL_NONE });
  }

  setEditListName(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ editListName: event.target.value });
  }

  createList() {
    this.props.createList(this.state.editListName);
    this.setState({
      editListName: "",
      modalState: ModalState.MODAL_NONE
    });
  }

  editListName() {
    this.props.editCurrentListName(this.state.editListName);
    this.setState({
      editListName: "",
      modalState: ModalState.MODAL_NONE
    });
  }

  deleteList() {
    this.props.deleteCurrentList();
    this.setState({ modalState: ModalState.MODAL_NONE });
  }

  addSong() {
    // 全曲一覧を省いたリストのため、インデックスには1を足す
    this.props.addSongToList(
      this.state.addListIndex + 1,
      this.props.songListList[this.props.currentListIndex]
      .songList[this.state.songMenuClickedIndex]);
    this.setState({ modalState: ModalState.MODAL_NONE });
  }

  deleteSong() {
    this.props.deleteSongFromList(this.state.songMenuClickedIndex);
    this.setState({ modalState: ModalState.MODAL_NONE });
  }

  exportUserList() {
    const userSongListJson = localStorage.getItem("allSongList");
    if (typeof userSongListJson === "string") {
      const blob = new Blob([userSongListJson], { type: "application/json" });
      let dummyElem = document.createElement("a");
      document.body.appendChild(dummyElem);
      dummyElem.href = window.URL.createObjectURL(blob);
      dummyElem.download = "userList.json";
      dummyElem.click();
      document.body.removeChild(dummyElem);
    }
  }

  importUserList(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files.length != 0) {
      const file = e.target.files[0];
      const render = new FileReader();
      render.onload = () => {
        if (typeof render.result === "string") {
          let tmp = [];
          const parsed = JSON.parse(render.result) as NamedSongList[];
          parsed.forEach((songList) => {
            // 初期読み込み時同様ID振り直し
            for (let i = 0; i < songList.songList.length; i++) {
              songList.songList[i].id = i;
            }
            tmp.push(songList);
          })
          this.props.concatSongList(tmp);
        }
      }
      render.readAsText(file);
    }
  }

  fireImport() {
    document.getElementById("importFile").click();
  }

  render() {
    return(
      <div className="songList">
        { this.props.userPlayList &&
          this.props.songListList.length != 0 &&
          <div className="userListEdit">
            <select
              className="listSelect"
              value={this.props.currentListIndex}
              onChange={this.onListSelected}>
              {this.props.songListList.map((listElem, index) => {
                return <option
                  value={index.toString()}
                  key={index.toString()}>
                  {listElem.name}
                </option>;
              })}
            </select>
            <span
              className="buttonText editButton"
              onClick={this.onListMenuClick}>
              Edit
            </span>
            { this.state.listMenuClicked &&
              <div>
                <div
                  id="editButtonCover"
                  className="checkBoxCover"
                  onClick={this.onListMenuRelease}>
                </div>
                <div
                  id="editButtonContent"
                  className="menuContent">
                  <ul>
                    {this.props.currentListIndex == 0 &&
                      <li className="disable">リスト名変更</li>
                    }
                    {this.props.currentListIndex != 0 &&
                      <li onClick={this.displayRenameDialog}>リスト名変更</li>
                    }
                    {this.props.currentListIndex == 0 &&
                      <li className="disable">リスト削除</li>
                    }
                    {this.props.currentListIndex != 0 &&
                      <li onClick={this.displayDeleteDialog}>リスト削除</li>
                    }
                    <li onClick={this.displayCreateDialog}>新規リスト作成</li>
                    {this.props.songListList.length != 1 &&
                      <li onClick={this.exportUserList}>Export</li>
                    }
                    <li onClick={this.fireImport}>
                      Import
                      <input
                        type="file"
                        id="importFile"
                        accept="application/json"
                        onChange={this.importUserList}/>
                    </li>
                  </ul>
                </div>
              </div>
            }
          </div>
        }
        { this.props.songListList.length != 0 &&
          <div className="selectedList"
            style={this.props.userPlayList ? {} : {height: "100%"}}>
            <ReactSortable
              list={this.props.songListList[this.props.currentListIndex].songList}
              setList={this.props.resetCurrentList}
              delay={1000}
              delayOnTouchOnly={true}
            >
              {this.props.songListList[this.props.currentListIndex].songList.map((song, index) => {
                return <div className="songElemWrapper">
                  <SongElem
                    key={index}
                    songData={song}
                    userPlayList={this.props.userPlayList}
                    index={index}
                    onItemClickListener={this.onSongElemClick}
                    onMenuClickListener={this.onSongElemMenuClick} />
                  {
                    this.state.songMenuClicked &&
                    this.state.songMenuClickedIndex == index &&
                    <div
                      className="menuContent songListElemMenu">
                      <ul>
                        <li onClick={this.displayAddDialog}>リストに追加</li>
                        {this.props.currentListIndex == 0 &&
                          <li className="disable">削除</li>
                        }
                        {this.props.currentListIndex != 0 &&
                          <li onClick={this.displayDeleteElemDialog}>削除</li>
                        }
                      </ul>
                    </div>
                  }
                  </div>;
              })}
            </ReactSortable>
          </div>
        }
        { this.state.songMenuClicked &&
          <div
            className="checkBoxCover"
            onClick={this.onSongElemMenuRelease}></div>
        }
        <Modal
          isOpen={this.state.modalState === ModalState.MODAL_CREATE}
          onRequestClose={this.closeDialog}
          style={defaultDialogStyle}>
          <div className="dialog">
            <input
              className="listNameInput"
              type="text"
              value={this.state.editListName}
              onChange={this.setEditListName}
              placeholder="リスト名を入力してください" />
            <div className="dialogButtonArea">
              <span
                className="buttonText"
                onClick={this.closeDialog}>
                キャンセル
              </span>
              <span
                className="buttonText"
                onClick={this.createList}>
                OK
              </span>
            </div>
          </div>
        </Modal>
        <Modal
          isOpen={this.state.modalState === ModalState.MODAL_RENAME}
          onRequestClose={this.closeDialog}
          style={defaultDialogStyle}>
          <div className="dialog">
            <input
              className="listNameInput"
              type="text"
              value={this.state.editListName}
              onChange={this.setEditListName}
              placeholder="リスト名を入力してください" />
            <div className="dialogButtonArea">
              <span
                className="buttonText"
                onClick={this.closeDialog}>
                キャンセル
              </span>
              <span
                className="buttonText"
                onClick={this.editListName}>
                OK
              </span>
            </div>
          </div>
        </Modal>
        <Modal
          isOpen={this.state.modalState === ModalState.MODAL_DELETE}
          onRequestClose={this.closeDialog}
          style={{
            overlay: defaultDialogStyle.overlay,
            content: Object.assign(
              defaultDialogStyle.content,
              { height: "8rem" })
          }}>
          <div className="dialog">
            <div className="deleteListNameDisp">
              <div>
                <span className="dialogText">
                  {this.props.songListList[this.props.currentListIndex].name}
                </span>
              </div>
              <div>
                <span className="dialogText">
                  を削除してもよろしいですか？
                </span>
              </div>
            </div>
            <div className="dialogButtonArea">
              <span
                className="buttonText"
                onClick={this.closeDialog}>
                キャンセル
              </span>
              <span
                className="buttonText"
                onClick={this.deleteList}>
                削除する
              </span>
            </div>
          </div>
        </Modal>
        <Modal
          isOpen={this.state.modalState === ModalState.MODAL_ADD}
          onRequestClose={this.closeDialog}
          style={defaultDialogStyle}>
          <div className="dialog">
            <select
              className="listNameInput"
              value={this.state.addListIndex}
              onChange={this.onAddListSelected}>
              {this.props.songListList.slice(1).map((listElem, index) => {
                return <option
                  value={index.toString()}
                  key={index.toString()}>
                  {listElem.name}
                </option>;
              })}
            </select>
            <div className="dialogButtonArea">
              <span
                className="buttonText"
                onClick={this.closeDialog}>
                キャンセル
              </span>
              <span
                className="buttonText"
                onClick={this.addSong}>
                OK
              </span>
            </div>
          </div>
        </Modal>
        <Modal
          isOpen={this.state.modalState === ModalState.MODAL_DELETE_ELEM}
          onRequestClose={this.closeDialog}
          style={{
            overlay: defaultDialogStyle.overlay,
            content: Object.assign(
              defaultDialogStyle.content,
              { height: "8rem" })
          }}>
          <div className="dialog">
            <div className="deleteListNameDisp">
              <div>
                <span className="dialogText">
                  {this.props.songListList[this.props.currentListIndex] &&
                    this.props.songListList[this.props.currentListIndex]
                      .songList[this.state.songMenuClickedIndex] &&
                    this.props.songListList[this.props.currentListIndex]
                      .songList[this.state.songMenuClickedIndex].songName}
                </span>
              </div>
              <div>
                <span className="dialogText">
                  を削除してもよろしいですか？
                </span>
              </div>
            </div>
            <div className="dialogButtonArea">
              <span
                className="buttonText"
                onClick={this.closeDialog}>
                キャンセル
              </span>
              <span
                className="buttonText"
                onClick={this.deleteSong}>
                削除する
              </span>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}
