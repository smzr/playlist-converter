import React, {Component} from 'react';
import './App.css';
import './bootstrap-grid.css';
import queryString from 'query-string';
import FlipMove from 'react-flip-move';
import Switch from "react-switch";
import { faRandom, faTrash, faExchangeAlt, faSyncAlt, faCheck, faTasks, faEdit, faTimes, faExclamationTriangle, faCaretDown, faSlidersH   } from "@fortawesome/free-solid-svg-icons";
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
                                        <div id="header-content">
                                                <a id="logo" href="#/">
                                                        <FontAwesomeIcon icon={faTasks} size="lg" />
                                                        <h1>Playlist Converter</h1>
                                                </a>
                                                <div className="auth-btns">
                                                        <button className="btn-1 btn-spotauth" onClick={() => window.location = 'https://playlist-converter-backend.herokuapp.com/spotify/authenticate/'} ><span>Auth Spotify</span></button>
                                                        <button className="btn-1 btn-ytauth" onClick={() => window.location = 'https://playlist-converter-backend.herokuapp.com/youtube/authenticate/'} ><span>Auth YouTube</span></button>
                                                </div>
                                        </div>
                                        <div className="progress-bar-container">
                                                <div className="progress-bar" style={{width : this.state.progress + '%'}}></div>
                                        </div>
                                </header>
                                <TrackList playlistId={this.state.playlistId} onPlaylistIdChange={this.handlePlaylistIdChange} onProgressChange={this.handleProgressChange}/>
                                <br/>
                                <div className="destPL"><p className="destPL-text">{this.state.playlistId}</p><button onClick={()=>this.togglePopup()} className="btn-1"><FontAwesomeIcon icon={faEdit} size="lg" /><span className="btn-text">New Playlist</span></button></div>
                                <br/>
                                <div>
                                        <button onClick={() => window.open('https://www.youtube.com/playlist?list='+this.state.playlistId)} className="btn-1 btn-yt"><FontAwesomeIcon icon={faYoutube} size="lg" /><span className="btn-text">Open YouTube Playlist</span></button>
                                </div>
                                {this.state.showPopup ? <Popup closePopup={this.togglePopup} onPlaylistIdChange={this.handlePlaylistIdChange}/> : null}
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
                        showSettings: false
                };

                this.handlePlaylistIdChange = this.handlePlaylistIdChange.bind(this)
                this.toggleSettings = this.toggleSettings.bind(this)
        }

        componentDidMount() {
                if (!localStorage.retainList) {
                        localStorage.retainList = false
                }
                if (JSON.parse(localStorage.retainList) && localStorage.list_backup) {
                        this.setState({list: JSON.parse(localStorage.list_backup)})
                }
                else if (!JSON.parse(localStorage.retainList)) {
                        localStorage.removeItem("list_backup")
                }
        }

        handlePlaylistIdChange(playlistId) {
          this.props.onPlaylistIdChange(playlistId);
        }

        toggleSettings() {
                this.setState({showSettings: !this.state.showSettings})
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
                if (JSON.parse(localStorage.retainList)) {
                        localStorage.list_backup = JSON.stringify(listBuffer)
                }
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
                if (JSON.parse(localStorage.retainList)) {
                        localStorage.list_backup = JSON.stringify(listBuffer)
                }
        }
        removeItem(key) {
                var filteredList = this.state.list.filter(function(item){
                        return (item.key !== key)
                })
                this.setState({list: filteredList})
                if (JSON.parse(localStorage.retainList)) {
                        localStorage.list_backup = JSON.stringify(filteredList)
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
                if (JSON.parse(localStorage.retainList)) {
                        localStorage.list_backup = JSON.stringify(listBuffer)
                }
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
                localStorage.removeItem("list_backup")
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
                if (JSON.parse(localStorage.retainList)) {
                        localStorage.list_backup = JSON.stringify(listBuffer)
                }
        }


        render() {
                let shuffle = <button onClick={()=>this.shuffle()} className="btn-1 tool"><FontAwesomeIcon icon={faRandom} size="lg" /><span className="btn-text">Shuffle</span></button>;
                let clearList = <button onClick={()=>this.clearList()} className="btn-1 tool"><FontAwesomeIcon icon={faTrash} size="lg"/><span className="btn-text">Clear List</span></button>;
                let transfer = <button onClick={()=>this.insertPlaylistItems()} className="btn-1 tool"><FontAwesomeIcon icon={faExchangeAlt} size="lg"/><span className="btn-text">Transfer Songs</span></button>;
                let settings = <button onClick={()=> this.toggleSettings()} className="btn-1 tool"><FontAwesomeIcon icon={faSlidersH} size="lg"/><span className="btn-text">Settings</span></button>;
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
                                                        <p className="col-sm-2 col-xs-3">Album</p>
                                                        <p className="col-sm-8 col-xs-6">Title/Artist</p>
                                                        <p className="col-sm-2 col-xs-3">{this.state.list.length} songs</p>
                                                </li>
                                                {this.state.list.map(item =>
                                                        <li onClick={()=>this.removeItem(item.key)} key={item.key}>
                                                                <div className="album col-sm-2 col-xs-3"><img alt={item.name + ' - ' + item.artist} src={item.img}/></div>
                                                                <div className="metatext col-sm-8 col-xs-6"><p className="trackname">{item.name}</p><p className="artist">{item.artist}</p></div>
                                                                <div className="col-sm-2 col-xs-3"><FontAwesomeIcon icon={ item.icon } size="lg" style={{display: item.icondisplay}}/></div>
                                                        </li>
                                                )}
                                        </FlipMove>
                                </ul>
                                <div className="toolbar">
                                        {this.state.list.length ?
                                        <div className="toolbar-buttons">
                                                <div className="toolbar-left">
                                                        <div>{settings}</div>
                                                </div>
                                                <div className="toolbar-right">
                                                        <div>{shuffle}</div>
                                                        <div>{clearList}</div>
                                                        <div>{transfer}</div>
                                                </div>
                                        </div>
                                        : " "}
                                </div>
                                {this.state.showSettings ? <Settings closeSettings={this.toggleSettings} list={this.state.list} /> : null}
                        </div>
                )
        }
}

class Popup extends Component {
        constructor(props) {
                super(props)
                this.state = {
                        title: '',
                        description: '',
                        privacy: 'private',
                        error: {
                                show: false,
                                code: '',
                                msg: ''
                        }
                }

                this.handleSubmit = this.handleSubmit.bind(this)
        }

        handleSubmit(e) {
                e.preventDefault();
                let title = this.state.title;
                let description = this.state.description;
                let privacy = this.state.privacy;
                this.createPlaylist(title, description, privacy);
        }

        createPlaylist(title, description, privacy) {
                let yt = localStorage.youtube_access_token;
                fetch('https://www.googleapis.com/youtube/v3/playlists?part=snippet,status', {
                        method: 'POST',
                        headers: {
                                'Content-type': 'application/json',
                                'Authorization': 'Bearer ' + yt
                        },
                        body: JSON.stringify({
                                'snippet':
                                {
                                        'title':title,
                                        'description':description
                                },
                                'status':
                                {
                                        'privacyStatus':privacy
                                }
                        })
                }).then(response => response.json()).then(data => {
                        console.log(data)
                        if (data.error === undefined) {
                                this.props.onPlaylistIdChange(data.id);
                                this.props.closePopup();
                        }
                        else {
                                this.setState({error : {show: true, code: data.error.code, msg: data.error.message}})
                        }
                })
        }

        render() {
                return (
                        <div className='popup'>
                                <div className='popup_inner'>
                                        <div className="popup_header">
                                                <h3>Create new YouTube Playlist</h3>
                                                <button onClick={this.props.closePopup} className="close"><FontAwesomeIcon icon={faTimes} size="lg" /></button>
                                        </div>
                                        <div className="popup_body">
                                                {this.state.error.show ?
                                                        <div className="error">
                                                                <div className="error-header">
                                                                        <h4><FontAwesomeIcon icon={faExclamationTriangle} />Error!</h4>
                                                                        <button onClick={() => this.setState({error : {show: false}})} id="error-close" className="close"><FontAwesomeIcon icon={faTimes} /></button>
                                                                </div>
                                                                <div className="error-body">
                                                                        <b>{this.state.error.code}</b> {this.state.error.msg}
                                                                </div>
                                                        </div>
                                                : null}
                                                <form onSubmit={this.handleSubmit}>
                                                        <label>
                                                                <span>Title:</span><br/>
                                                        <textarea name="title" required maxLength="150" value={this.state.title} onChange={e => this.setState({title: e.target.value})} />
                                                        </label>
                                                        <br/>
                                                        <label>
                                                                <span>Description:</span><br/>
                                                        <textarea name="description" maxLength="5000" value={this.state.description} onChange={e => this.setState({description: e.target.value})} />
                                                        </label>
                                                        <br/>
                                                        <label>
                                                                <span>Playlist privacy:</span><br/>
                                                                <div className="select">
                                                                <span className="arrow"><FontAwesomeIcon icon={faCaretDown} /></span>
                                                                        <select value={this.state.privacy} onChange={e => this.setState({privacy: e.target.value})}>
                                                                                <option value="public">Public</option>
                                                                                <option value="unlisted">Unlisted</option>
                                                                                <option value="private">Private</option>
                                                                        </select>
                                                                </div>
                                                        </label>
                                                        <input name="submit" type="submit" value="Create" />
                                                </form>

                                        </div>
                                </div>
                        </div>
                );
        }
}

class Settings extends Component {
        constructor(props) {
                super(props)
                this.state = {
                }

                this.handleCheck = this.handleCheck.bind(this)
        }

        handleCheck(checked) {
                localStorage.retainList = JSON.stringify(checked)
                this.forceUpdate()
                if (checked) {
                        localStorage.list_backup = JSON.stringify(this.props.list)
                }
                else if (!checked) {
                        localStorage.removeItem("list_backup")
                }
        }

        render() {
                return (
                        <div className='popup'>
                                <div className='popup_inner'>
                                        <div className="popup_header">
                                                <h3>Preferences</h3>
                                                <button onClick={this.props.closeSettings} className="close"><FontAwesomeIcon icon={faTimes} size="lg" /></button>
                                        </div>
                                        <div className="popup_body">
                                                <div className="row">
                                                        <div className="col">
                                                                <span className="field-name">Remember last playlist</span>
                                                                        <label htmlFor="remember-playlist-switch" className="checkbox">
                                                                                <span>Store your playlist when the app is closed.</span>
                                                                                <Switch
                                                                                        onChange={this.handleCheck}
                                                                                        checked={JSON.parse(localStorage.retainList)}
                                                                                        onColor="#30afd6"
                                                                                        handleDiameter={25}
                                                                                        uncheckedIcon={false}
                                                                                        checkedIcon={false}
                                                                                        activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                                                                                        height={25}
                                                                                        width={45}
                                                                                        id="remember-playlist-switch" />
                                                                      </label>
                                                        </div>
                                                </div>
                                        </div>
                                </div>
                        </div>
                );
        }
}

export default App;
