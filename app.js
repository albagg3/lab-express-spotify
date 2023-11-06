require('dotenv').config();

const express = require('express');
const hbs = require('hbs');

// require spotify-web-api-node package here:
const SpotifyWebApi = require('spotify-web-api-node');
const app = express();

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
});

  // Retrieve an access token
spotifyApi
    .clientCredentialsGrant()
    .then(data => spotifyApi.setAccessToken(data.body['access_token']))
    .catch(error => console.log('Something went wrong when retrieving an access token', error));
// Our routes go here:
app.get("/", (req,res)=>{
    res.render("homePage")
})

app.get("/artist-search", (req,res)=>{
    console.log(req.query.searchValue);
    spotifyApi
        .searchArtists(req.query.searchValue) /*'HERE GOES THE QUERY ARTIST'*/
        .then(data => {
            console.log('The received data from the API: ', data.body);
            // ----> 'HERE'S WHAT WE WANT TO DO AFTER RECEIVING THE DATA FROM THE API'
            const artists = data.body.artists.items;
            return res.render("artist-search-results.hbs",{artists: artists});
        })
        .catch(err => console.log('The error while searching artists occurred: ', err));
})

app.get("/albums/:artistsId", (req,res,next)=>{
    spotifyApi.getArtistAlbums(req.params.artistsId)
        .then((data)=>{
            let selectedAlbum = [];
            data.body.items.forEach((album)=>{
                if(album.artists[0].id === req.params.artistsId)
                {
                    selectedAlbum.push(album);
                }
            })
            return res.render("albums.hbs", {album: selectedAlbum});
        })
})


app.get("/tracks/:trackId", (req,res)=>{
    spotifyApi.getAlbumTracks(req.params.trackId)
        .then((data)=>{
            console.log("TRACKS", data.body)
            const tracksArr = data.body.items
            return res.render("tracks.hbs", {tracks: tracksArr})
        })
})

app.listen(3000, () => console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊'));
