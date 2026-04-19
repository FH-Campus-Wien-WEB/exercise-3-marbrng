const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const movieModel = require("./movie-model.js");

const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "files")));

app.get("/genres", function (req, res) {
  // Flatten all genre arrays, remove duplicates, then sort alphabetically.
  const genres = [...new Set(
    Object.values(movieModel).flatMap(function (movie) {
      return movie.Genres;
    }),
  )].sort(function (left, right) {
    return left.localeCompare(right);
  });

  res.json(genres);
});

app.get("/movies", function (req, res) {
  let movies = Object.values(movieModel);
  const genre = req.query.genre;

  if (genre) {
    // Only keep movies whose Genres array contains the requested genre.
    movies = movies.filter(function (movie) {
      return movie.Genres.includes(genre);
    });
  }

  res.json(movies);
});

app.get("/movies/:imdbID", function (req, res) {
  const movie = movieModel[req.params.imdbID];

  if (movie) {
    res.json(movie);
  } else {
    res.sendStatus(404);
  }
});

app.put("/movies/:imdbID", function (req, res) {
  const imdbID = req.params.imdbID;
  const movie = req.body;

  // Enforce the path parameter as the canonical imdbID.
  movie.imdbID = imdbID;

  if (movieModel[imdbID]) {
    movieModel[imdbID] = movie;
    res.sendStatus(200);
  } else {
    movieModel[imdbID] = movie;
    res.status(201).json(movie);
  }
});

app.listen(3000);

console.log("Server now listening on http://localhost:3000/");
