import React, {Component} from 'react';
import './App.css';
import './bootstrap-grid.css';
import queryString from 'query-string';
import FlipMove from 'react-flip-move';
const feather = require('feather-icons')

class App extends Component {
        render() {
                return (
                        <div className="App">
                                <h1>Playlist Converter</h1>
                                <h2>Spotify to YouTube</h2>
                                <button className="spotify-btn" onClick={() => window.location = 'http://localhost:8888/spotify/authenticate'}>Load Spotify data</button>
                                <br/>
                                <button className="youtube-btn" onClick={() => window.location = 'http://localhost:8888/youtube/authenticate'}>Load YouTube data</button>
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
                        playlistId: 'PLaq91DRBmQjAYAln54eYN6DZ5kwRazDt_',
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
                        icon: ''
                }
                let listBuffer = this.state.list;
                let emt = Object.create(element)
                emt.key = 'custom'+text
                emt.name = text.split('-')[0]
                emt.artist = text.split('-')[1]
                emt.searchTerm = text
                emt.img = 'https://i.imgur.com/4I6yRjO.png'
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
                                listBuffer[i]['icon'] = feather.icons[icon].toSvg()
                        }
                }
                this.setState({list: listBuffer})
        }
        handleClick() {
                let id = this.state.inputURI.split('playlist:')[1];
                let parsed = queryString.parse(window.location.search);
                let spot = parsed.spotify_access_token;
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
                let yt = parsed.youtube_access_token;
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
                let yt = parsed.youtube_access_token;
                let progressIncrement = 100 * (1 / listBuffer.length)
                let progressBuffer = 0
                function insertLoop() {
                        thisBuffer.changeIcon(listBuffer[i].key, 'refresh-cw')
                        fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&type=video&q='+listBuffer[i].searchTerm, {
                                headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': 'Bearer ' + yt
                                }
                        }).then(response => response.json()).then(data => {
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
                                        thisBuffer.changeIcon(listBuffer[i].key, 'check')
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
                let shuffle = <button onClick={()=>this.shuffle()} className="btn-1 tool" dangerouslySetInnerHTML={{__html: feather.icons.shuffle.toSvg() + '<span class="btn-text hovertext">Shuffle</span>'}}></button>;
                let clearList = <button onClick={()=>this.clearList()} className="btn-1 tool" dangerouslySetInnerHTML={{__html: feather.icons.trash.toSvg() + '<span class="btn-text hovertext">Clear List</span>'}}></button>;
                let transfer = <button onClick={()=>this.insertPlaylistItems()} className="btn-1 tool" dangerouslySetInnerHTML={{__html: feather.icons.upload.toSvg() + '<span class="btn-text hovertext">Transfer Songs</span>'}}></button>;
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
                                                                <p className="metatext col-8"><b>{item.name}</b><br/>{item.artist}</p>
                                                                <div className="col-2" dangerouslySetInnerHTML={{__html: item.icon}}></div>
                                                        </li>
                                                )}
                                        </FlipMove>
                                </ul>
                                <FlipMove className="toolbar" duration={250} easing="ease-out">
                                        {buttons.map(btn =>
                                                <div>{btn}</div>
                                        )}
                                </FlipMove>
                                <br/>
                                <div className="progress-bar-container" style={{width: this.state.progresswidth+'%'}}>
                                        <div className="progress-bar" style={{width : this.state.progress + '%'}}></div>
                                </div>
                                <br/>
                                <button onClick={()=>this.createPlaylist()} className="btn-1" style={{display : 'none'}}>Create Youtube Playlist</button>
                                <p style={{display : 'none'}}>Current playlist: {this.state.playlistId}</p>
                                <div>
                                        <button onClick={() => window.open('https://www.youtube.com/playlist?list='+this.state.playlistId)} className="btn-1 btn-yt" dangerouslySetInnerHTML={{__html: feather.icons['external-link'].toSvg() + '<span class="btn-text hovertext">Open YouTube Playlist</span>'}}></button>
                                </div>
                        </div>
                )
        }
}

export default App;
