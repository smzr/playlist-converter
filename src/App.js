import React, {Component} from 'react';
import './App.css';
import './bootstrap-grid.css';
import queryString from 'query-string';
import FlipMove from 'react-flip-move';
import { faRandom, faTrash, faExchangeAlt, faSyncAlt, faCheck, faListUl } from "@fortawesome/free-solid-svg-icons";
import { faYoutube } from "@fortawesome/free-brands-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

class App extends Component {
      constructor(props) {
            super(props)
            this.state = {
                  spotify_access_token: '',
                  youtube_access_token: ''
            }
      }
      componentDidMount() {
            let parsed = queryString.parse(window.location.search);
            if (parsed.spotify_access_token !== undefined) {
                  localStorage.spotify_access_token = parsed.spotify_access_token
            }
            if (parsed.youtube_access_token !== undefined) {
                  localStorage.youtube_access_token = parsed.youtube_access_token
            }
      }
      render() {
            return (
                  <div className="App">
                        <header>
                              <div id="header-content">
                                    <a id="logo" href="#/">
                                          <FontAwesomeIcon icon={faListUl} size="lg" />
                                          <h1>Playlist Converter</h1>
                                    </a>
                              </div>
                        </header>
                        <button className="spotify-btn" onClick={() => window.location = 'http://localhost:8888/spotify/authenticate/?spotify_access_token=' + this.state.spotify_access_token + '&youtube_access_token=' + this.state.youtube_access_token}>Auth Spotify</button>
                        <br/>
                        <button className="youtube-btn" onClick={() => window.location = 'http://localhost:8888/youtube/authenticate/?spotify_access_token=' + this.state.spotify_access_token + '&youtube_access_token=' + this.state.youtube_access_token}>Auth YouTube</button>
                        <TrackList/>
                  </div>
            );
      }
}

class TrackList extends Component {
      constructor(props) {
            super(props)
            this.state = {
                  userInput: '',
                  inputURI:'',
                  list: [],
                  progress: '0',
                  progresswidth: '0',
                  playlistId: 'PLaq91DRBmQjAaSqcKlg-1Fgz9DWIUPZ8V',
                  history: []
            }
      }
      addToList(spotdata) {
            let listBuffer = this.state.list;
            const element = {
                  key: '',
                  name: '',
                  artist: '',
                  searchTerm: '',
                  img: '',
                  icon: '',
            }
            for (let i = 0; i < spotdata.tracks.total; i++) {
                  let emt = Object.create(element)
                  emt.key = spotdata.tracks.items[i].track.id
                  emt.name = spotdata.tracks.items[i].track.name
                  emt.artist = spotdata.tracks.items[i].track.artists[0].name
                  emt.searchTerm = spotdata.tracks.items[i].track.name + ' ' + spotdata.tracks.items[i].track.artists[0].name
                  let dupe = false
                  for (let j = 0; j < listBuffer.length; j++) {
                        if (listBuffer[j].key === emt.key) {
                              dupe= true
                              break
                        }
                  }
                  if (!dupe && !(spotdata.tracks.items[i].is_local)){
                        emt.img = spotdata.tracks.items[i].track.album.images[2].url
                        listBuffer.push(emt)
                  }
            }
            this.setState({list: listBuffer, progresswidth: 100})
      }
      addItem(text) {
            const element = {
                  key: '',
                  name: '',
                  artist: '',
                  searchTerm: '',
                  img: '',
                  icon: '',
                  icondisplay: '',
            }
            let listBuffer = this.state.list;
            let emt = Object.create(element)
            emt.key = 'custom'+text
            emt.name = text.split('-')[0]
            emt.artist = text.split('-')[1]
            emt.searchTerm = text
            emt.img = 'https://i.imgur.com/4I6yRjO.png'
            emt.icon = faSyncAlt
            emt.icondisplay = 'none'
            let dupe = false;
            for (let j = 0; j < listBuffer.length; j++) {
                  if (listBuffer[j].key === emt.key) {
                        dupe= true
                        break
                  }
            }
            if (!dupe){
                  listBuffer.push(emt)
            }
            this.setState({list: listBuffer, userInput: ''})
            this.setState({progresswidth: 100})
      }
      removeItem(key) {
            var filteredList = this.state.list.filter(function(item){
                  return (item.key !== key)
            })
            this.setState({list: filteredList})
            if (filteredList.length === 0) {
                  this.setState({progresswidth: 0})
            }
      }
      changeIcon(key, icon) {
            let listBuffer = this.state.list
            for (let i = 0; i < listBuffer.length; i++) {
                  if (listBuffer[i].key === key) {
                        listBuffer[i]['icon'] = ''
                  }
            }
            this.setState({list: listBuffer})
      }
      handleClick() {
            let id = this.state.inputURI.split('playlist:')[1];
            let spot = localStorage.spotify_access_token;
            fetch('https://api.spotify.com/v1/playlists/' + id, {
                  headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + spot
                  }
            }).then(response => response.json()).then(spotdata => {
                  console.log(spotdata)
                  this.addToList(spotdata)
                  this.setState({inputURI: ''})
            })

      }
      createPlaylist(title){
            let parsed = queryString.parse(window.location.search);
            let yt = localStorage.youtube_access_token;
            // create youtube playlist
            fetch('https://www.googleapis.com/youtube/v3/playlists?part=snippet', {
                  method: 'POST',
                  headers: {
                        'Content-type': 'application/json',
                        'Authorization': 'Bearer ' + yt,
                  },
                  body: JSON.stringify({
                        'snippet':
                        {
                              'title':title
                        }
                  })
            }).then(response => response.json()).then(ytdata => {
                  console.log(ytdata)
                  this.setState({playlistId: ytdata.id})
            })
      }
      insertPlaylistItems() {
            let i = 0;
            let listBuffer = this.state.list;
            let thisBuffer = this;
            let playlistId = this.state.playlistId;
            let parsed = queryString.parse(window.location.search);
            let yt =localStorage.youtube_access_token;
            let progressIncrement = 100 * (1 / listBuffer.length)
            let progressBuffer = 0
            function insertLoop() {
                  listBuffer[i].icon = faSyncAlt
                  listBuffer[i].icondisplay = 'inherit'
                  thisBuffer.forceUpdate()
                  fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&type=video&q='+listBuffer[i].searchTerm, {
                        headers: {
                              'Content-Type': 'application/json',
                              'Authorization': 'Bearer ' + yt
                        }
                  }).then(response => response.json()).then(data => {
                        console.log(data)
                        // insert video(s) into youtube playlist
                        fetch('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet', {
                              method: 'POST',
                              headers: {
                                    'Content-type': 'application/json',
                                    'Authorization': 'Bearer ' + yt,
                              },
                              body: JSON.stringify({
                                    'snippet':
                                    {
                                          'playlistId': playlistId,
                                          'resourceId': {
                                                'kind': 'youtube#video',
                                                'videoId': data.items[0].id.videoId
                                          }
                                    }
                              })
                        }).then(response => response.json()).then(playlistdata =>{
                              console.log(playlistdata)
                              listBuffer[i].icon = faCheck
                              listBuffer[i].icondisplay = 'inherit'
                              progressBuffer += progressIncrement
                              thisBuffer.setState({progress: progressBuffer})
                              i++
                              if (i < listBuffer.length) {
                                    insertLoop()
                              } else {
                                    thisBuffer.setState({progresswidth: 0})
                              }
                        })
                  })
            }
            insertLoop()
      }
      clearList() {
            this.setState({list: [], progresswidth: 0})
      }
      shuffle() {
            let listBuffer = this.state.list;
            var j, x, i;
            for (i = listBuffer.length - 1; i > 0; i--) {
                  j = Math.floor(Math.random() * (i + 1));
                  x = listBuffer[i];
                  listBuffer[i] = listBuffer[j];
                  listBuffer[j] = x;
            }
            this.setState({list: listBuffer})
      }


      render() {
            let shuffle = <button onClick={()=>this.shuffle()} className="btn-1 tool"><FontAwesomeIcon icon={faRandom} size="lg" /><span className="btn-text hovertext">Shuffle</span></button>;
                  let clearList = <button onClick={()=>this.clearList()} className="btn-1 tool"><FontAwesomeIcon icon={faTrash} size="lg"/><span className="btn-text hovertext">Clear List</span></button>;
                        let transfer = <button onClick={()=>this.insertPlaylistItems()} className="btn-1 tool"><FontAwesomeIcon icon={faExchangeAlt} size="lg"/><span className="btn-text hovertext">Transfer Songs</span></button>;
                              let buttons = [];
                              if (this.state.list.length === 0) {
                                    buttons = []
                              } else {
                                    buttons = [shuffle, clearList, transfer]
                              }
                              return (
                                    <div className="list-main">
                                          <div className="searchbar">
                                                <input type="text" placeholder="Spotify Playlist URI" value={this.state.inputURI} onChange={e => this.setState({inputURI: e.target.value})}/>
                                                <button className='submit' onClick={()=>this.handleClick()}>Add playlist</button>
                                          </div>
                                          <div className="searchbar">
                                                <input placeholder="Song - Artist" value={this.state.userInput} type="text" onChange={e => this.setState({userInput: e.target.value})}/>
                                                <button onClick={()=>this.addItem(this.state.userInput)}>Add custom song</button>
                                          </div>
                                          <ul className="row list-content">
                                                <FlipMove className="flipmove" duration={250} easing="ease-out">
                                                      <li key="legend" className="legend">
                                                            <p className="col-2">Album</p>
                                                            <p className="col-8">Title/Artist</p>
                                                            <p className="col-2">{this.state.list.length} songs</p>
                                                      </li>
                                                      {this.state.list.map(item =>
                                                            <li onClick={()=>this.removeItem(item.key)} key={item.key}>
                                                                  <div className="album col-2"><img alt={item.name + ' - ' + item.artist} src={item.img}/></div>
                                                                  <div className="metatext col-8"><p className="trackname">{item.name}</p><p className="artist">{item.artist}</p></div>
                                                                  <div className="col-2"><FontAwesomeIcon icon={ item.icon } size="lg" style={{display: item.icondisplay}}/></div>
                                                            </li>
                                                      )}
                                                </FlipMove>
                                          </ul>
                                          <div className="toolbar">
                                                <FlipMove className="toolbar-buttons" duration={250} easing="ease-out">
                                                      {buttons.map(btn =>
                                                            <div>{btn}</div>
                                                      )}
                                                </FlipMove>
                                          </div>
                                          <br/>
                                          <div className="progress-bar-container" style={{width: this.state.progresswidth+'%'}}>
                                                <div className="progress-bar" style={{width : this.state.progress + '%'}}></div>
                                          </div>
                                          <br/>
                                          <button onClick={()=>this.createPlaylist()} className="btn-1" style={{display : 'none'}}>Create Youtube Playlist</button>
                                          <p style={{display : 'none'}}>Current playlist: {this.state.playlistId}</p>
                                          <div>
                                                <button onClick={() => window.open('https://www.youtube.com/playlist?list='+this.state.playlistId)} className="btn-1 btn-yt"><FontAwesomeIcon icon={faYoutube} size="lg" /><span className="btn-text hovertext">Open YouTube Playlist</span></button>
                                          </div>
                                    </div>
                              )
                        }
                  }

                  export default App;
