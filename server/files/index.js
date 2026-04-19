import { ElementBuilder, ParentChildBuilder } from "./builders.js";

class ParagraphBuilder extends ParentChildBuilder {
  constructor() {
    super("p", "span");
  }
}

class ListBuilder extends ParentChildBuilder {
  constructor() {
    super("ul", "li");
  }
}

function formatRuntime(runtime) {
  const hours = Math.trunc(runtime / 60);
  const minutes = runtime % 60;
  return hours + "h " + minutes + "m";
}

function appendMovie(movie, element) {
  new ElementBuilder("article").id(movie.imdbID)
    .append(
      new ElementBuilder("img")
        .with("src", movie.Poster)
        .with("alt", movie.Title + " poster"),
    )
    .append(new ElementBuilder("h2").text(movie.Title))
    .append(
      new ElementBuilder("p").append(
        new ElementBuilder("button")
          .class("edit-button")
          .with("type", "button")
          .text("Edit")
          .listener("click", function () {
            location.href = "edit.html?imdbID=" + movie.imdbID;
          }),
      ),
    )
    .append(
      new ParagraphBuilder().items(
        "Runtime " + formatRuntime(movie.Runtime),
        "\u2022",
        "Released on " + new Date(movie.Released).toLocaleDateString("en-US"),
      ),
    )
    .append(new ParagraphBuilder().childClass("genre").items(movie.Genres))
    .append(new ElementBuilder("p").text(movie.Plot))
    .append(new ElementBuilder("h3").pluralizedText("Director", movie.Directors))
    .append(new ListBuilder().items(movie.Directors))
    .append(new ElementBuilder("h3").pluralizedText("Writer", movie.Writers))
    .append(new ListBuilder().items(movie.Writers))
    .append(new ElementBuilder("h3").pluralizedText("Actor", movie.Actors))
    .append(new ListBuilder().items(movie.Actors))
    .appendTo(element);
}

function loadMovies(genre) {
  const xhr = new XMLHttpRequest();

  xhr.onload = function () {
    const mainElement = document.querySelector("main");
    // Clear the current movie cards before rendering the new result set.
    mainElement.replaceChildren();

    if (xhr.status === 200) {
      const movies = JSON.parse(xhr.responseText);
      for (const movie of movies) {
        appendMovie(movie, mainElement);
      }
    } else {
      mainElement.append(
        `Daten konnten nicht geladen werden, Status ${xhr.status} - ${xhr.statusText}`,
      );
    }
  };

  const url = new URL("/movies", location.href);

  if (genre) {
    // The server expects the selected genre as a query parameter named "genre".
    url.searchParams.set("genre", genre);
  }

  xhr.open("GET", url);
  xhr.send();
}

function appendGenreButton(label, genre, listElement) {
  new ElementBuilder("li")
    .append(
      new ElementBuilder("button")
        .with("type", "button")
        .text(label)
        .listener("click", function () {
          // Keep exactly one navigation button visually active at a time.
          for (const button of document.querySelectorAll("nav button")) {
            button.classList.remove("active");
          }

          this.classList.add("active");
          loadMovies(genre);
        }),
    )
    .appendTo(listElement);
}

window.onload = function () {
  const xhr = new XMLHttpRequest();

  xhr.onload = function () {
    const navElement = document.querySelector("nav");

    if (xhr.status === 200) {
      const genres = JSON.parse(xhr.responseText);
      const listElement = document.createElement("ul");

      appendGenreButton("All", "", listElement);

      for (const genre of genres) {
        appendGenreButton(genre, genre, listElement);
      }

      navElement.replaceChildren(listElement);
      // Trigger the first button so the initial movie list is loaded automatically.
      navElement.querySelector("button").click();
    } else {
      navElement.textContent =
        "Genres konnten nicht geladen werden.";
    }
  };

  xhr.open("GET", "/genres");
  xhr.send();
};
