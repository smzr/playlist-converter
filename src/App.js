import React, {Component} from 'react';
import './App.css';
import './bootstrap-grid.css';
import queryString from 'query-string';
import FlipMove from 'react-flip-move';
import { faRandom, faTrash, faExchangeAlt, faSyncAlt, faCheck, faListUl, faEdit, faTimes } from "@fortawesome/free-solid-svg-icons";
import { faYoutube } from "@fortawesome/free-brands-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

class App extends Component {
        constructor(props) {
                super(props)
                this.state = {
                        showPopup: false,
                        playlistId: '',
                        progress: 0
                };

                this.handlePlaylistIdChange = this.handlePlaylistIdChange.bind(this)
                this.handleProgressChange = this.handleProgressChange.bind(this)
                this.togglePopup = this.togglePopup.bind(this)
        }

        componentDidMount() {
                let parsed = queryString.parse(window.location.search);
                if (parsed.spotify_access_token !== undefined) {
                        localStorage.spotify_access_token = parsed.spotify_access_token
                }
                if (parsed.youtube_access_token !== undefined) {
                        localStorage.youtube_access_token = parsed.youtube_access_token
                }
                this.setState({playlistId: localStorage.playlist_id})
        }

        handlePlaylistIdChange(playlistId) {
                this.setState({playlistId: playlistId});
                localStorage.playlist_id = playlistId;
        }

        handleProgressChange(progress) {
                this.setState({progress: progress});
        }

        togglePopup() {
                this.setState({showPopup: !this.state.showPopup})
        }
        render() {
                return (
                        <div className="App">
                                <header>
                                        <div id="header-content" className="row">
                                                <a id="logo" className="col-4" href="#/">
                                                        <FontAwesomeIcon icon={faListUl} size="lg" />
                                                        <h1>Playlist Converter</h1>
                                                </a>
                                                <div className="auth-btns col-4 offset-4">
                                                        <button className="btn-1 btn-spotauth" onClick={() => window.location = 'http://localhost:8888/spotify/authenticate/?spotify_access_token=' + this.state.spotify_access_token + '&youtube_access_token=' + this.state.youtube_access_token}><span className="btn-text">Auth Spotify</span></button>
                                                        <button className="btn-1 btn-ytauth" onClick={() => window.location = 'http://localhost:8888/youtube/authenticate/?spotify_access_token=' + this.state.spotify_access_token + '&youtube_access_token=' + this.state.youtube_access_token}><span className="btn-text">Auth YouTube</span></button>
                                                </div>
                                        </div>
                                        <div className="progress-bar-container">
                                                <div className="progress-bar" style={{width : this.state.progress + '%'}}></div>
                                        </div>
                                </header>
                                <TrackList playlistId={this.state.playlistId} onPlaylistIdChange={this.handlePlaylistIdChange} onProgressChange={this.handleProgressChange}/>
                                <br/>
                                <div className="destPL"><p className="destPL-text">{this.state.playlistId}</p><button onClick={()=>this.togglePopup()} className="btn-1"><FontAwesomeIcon icon={faEdit} size="lg" /><span className="btn-text hovertext">New Playlist</span></button></div>
                                <br/>
                                <div>
                                        <button onClick={() => window.open('https://www.youtube.com/playlist?list='+this.state.playlistId)} className="btn-1 btn-yt"><FontAwesomeIcon icon={faYoutube} size="lg" /><span className="btn-text hovertext">Open YouTube Playlist</span></button>
                                </div>
                                {this.state.showPopup ? <Popup text='Close Me' closePopup={this.togglePopup} onPlaylistIdChange={this.handlePlaylistIdChange}/> : null}
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
                        list: []
                };

                this.handlePlaylistIdChange = this.handlePlaylistIdChange.bind(this)
        }

        handlePlaylistIdChange(playlistId) {
          this.props.onPlaylistIdChange(playlistId);
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
                this.setState({list: listBuffer})
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
        }
        removeItem(key) {
                var filteredList = this.state.list.filter(function(item){
                        return (item.key !== key)
                })
                this.setState({list: filteredList})
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
        insertPlaylistItems() {
                this.props.onProgressChange(0)
                let i = 0;
                let listBuffer = this.state.list;
                let thisBuffer = this;
                let playlistId = this.props.playlistId;
                let yt =localStorage.youtube_access_token;
                let progressIncrement = 100 * (1 / listBuffer.length)
                let progress = 0
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
                                        progress += progressIncrement
                                        thisBuffer.props.onProgressChange(progress)
                                        i++
                                        if (i < listBuffer.length) {
                                                insertLoop()
                                        }
                                })
                        })
                }
                insertLoop()
        }
        clearList() {
                this.setState({list: []})
                this.props.onProgressChange(0)
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
                        </div>
                )
        }
}

class Popup extends Component {
        constructor(props) {
                super(props)
                this.state = {
                        title: '',
                        description: ''
                }

                this.handleSubmit = this.handleSubmit.bind(this)
        }

        handleSubmit(e) {
                e.preventDefault();
                let title = e.target.title.value;
                let description = e.target.description.value;
                this.createPlaylist(title, description);
        }

        createPlaylist(title, description) {
                let yt = localStorage.youtube_access_token;
                fetch('https://www.googleapis.com/youtube/v3/playlists?part=snippet', {
                        method: 'POST',
                        headers: {
                                'Content-type': 'application/json',
                                'Authorization': 'Bearer ' + yt,
                        },
                        body: JSON.stringify({
                                'snippet':
                                {
                                        'title':title,
                                        'description':description
                                }
                        })
                }).then(response => response.json()).then(data => {
                        console.log(data)
                        this.props.onPlaylistIdChange(data.id);
                })
        }

        render() {
                return (
                        <div className='popup'>
                                <div className='popup_inner'>
                                        <div className="row popup_header">
                                                <h3 className="col-8">Create new YouTube Playlist</h3>
                                                <button onClick={this.props.closePopup} className="close col-1 offset-3"><FontAwesomeIcon icon={faTimes} size="lg" /></button>
                                        </div>
                                        <div className="popup_body">
                                                <form onSubmit={this.handleSubmit}>
                                                        <label>
                                                                Title:<br/>
                                                        <input name="title" type="text" required value={this.state.title} onChange={e => this.setState({title: e.target.value})} />
                                                        </label>
                                                        <br/>
                                                        <label>
                                                                Description:<br/>
                                                                <textarea name="description" value={this.state.description} onChange={e => this.setState({description: e.target.value})} />
                                                        </label>
                                                        <br/>
                                                        <input name="submit" type="submit" value="Create" />
                                                </form>

                                        </div>
                                </div>
                        </div>
                );
        }
}

export default App;
