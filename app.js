require('dotenv').config();

const express = require('express');
const hbs = require('hbs');
const bodyParser = require('body-parser');
// require spotify-web-api-node package here:
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
hbs.registerPartials(__dirname + "/views/partials");

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


// ------------- MIDDLEWARES --------------
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // we add this if we get params from the body


// Our routes go here:
app.get('/', (req, res) => {

    res.render('home');
});

app.get("/artist-search", (req, res) => {

    spotifyApi.searchArtists(req.query.searchBar) /* <-- HERE GOES THE QUERY ARTIST*/
        .then(data => {
            // ----> 'HERE'S WHAT WE WANT TO DO AFTER RECEIVING THE DATA FROM THE API'
            const artistData = (data.body.artists.items);
            res.render('artist-search-results', { artistData })
        })
        .catch(err => console.log('The error while searching artists occurred: ', err));
})


app.get('/albums/:artistId', (req, res, next) => {
    const artistId = req.params.artistId;
    spotifyApi.getArtistAlbums(artistId)
        .then ((data) => {
            const albumsData = data.body.items
            console.log(albumsData);
            res.render('albums', {albumsData})
        })
        .catch(err => console.log('The error while searching albums occurred: ', err));
});

app.listen(3000, () => console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊'));
