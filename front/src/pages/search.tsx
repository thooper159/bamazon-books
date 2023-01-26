import { query } from "express";
import React from "react";
import { AuthorRes, BookRes } from "../types";

function Search() {
    const [title, setTitle] = React.useState<string>("");
    const [author, setAuthor] = React.useState<string>("");
    const [year, setYear] = React.useState<string>("");
    const [genre, setGenre] = React.useState<string>("");
    const [id, setId] = React.useState<string>("");
    const [query, setQuery] = React.useState<string>("");
    const [books, setBooks] = React.useState<BookRes[]>([]);
    const [authors, setAuthors] = React.useState<AuthorRes[]>([]);
    const [error, setError] = React.useState<Error | null>(null);
    const [isLoaded, setIsLoaded] = React.useState<boolean>(false);

    React.useEffect(() => {
        getCurrentQuery();
    }, [title, author, year, genre]);

    function handleInputChange(event: React.ChangeEvent<HTMLFormElement>) {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        if (name === "title") {
            setTitle(value);
        } else if (name === "author") {
            //validate input
            if(isNaN(value)){
                invalidateInput("author");
            } else {
                validateInput("author");
                setAuthor(value);
            }
        } else if (name === "year") {
            //input should be a valid CE year
            //validate input
            if(isNaN(value)){
                invalidateInput("year");
            } else {
                validateInput("year");
                setYear(value);
            }
        } else if (name === "genre") {
            setGenre(value);
        } else if (name === "id") {
            //validate input
            if(isNaN(value)){
                invalidateInput("id");
            } else {
                validateInput("id");
                setId(value);
            }
        }
        //validate input
        //if input is invalid, change color of input box to red
    }

    function validateInput(input: string): void {
        document.getElementsByName(input)[0]!.style.backgroundColor = ""; 
    }
    function invalidateInput(input: string): void {
        document.getElementsByName(input)[0]!.style.backgroundColor = "lightcoral"; 
    }

    function getCurrentQuery(): void {
        let query = "Get all books";
        console.log("title", title);

        if (author) {
            query += ` by author_id ${author}`;
        }
        if (title) {
            query += ` with title ${title}`;
        }
        if (year && year !== "") {
            query += ` published in ${year}`;
        }
        if (genre) {
            query += ` of genre ${genre}`;
        }
        //set p with id query to query
        document.getElementById("query")!.innerHTML = query;
        console.log(query);
        console.log(year);
    }

    return (
        <div>
            <h3>Search for books by title, author_id, year, and/or genre.</h3>
            <div id="search-box">
                <form onChange={handleInputChange}>
                    <label>
                        Title:
                        <input type="text" name="title" />
                    </label>
                    <br></br>
                    <label>
                        Author (id):
                        <input type="text" name="author" />
                    </label>
                    <br></br>
                    <label>
                        Year:
                        <input type="text" name="year" />
                    </label>
                    <br></br>
                    <label>
                        Genre
                        <select name="genre">
                            <option value="">-</option>
                            <option value="dystopian">Dystopian</option>
                            <option value="romance">Romance</option>
                            <option value="fantasy">Fantasy</option>
                            <option value="horror">Horror</option>
                            <option value="mystery">Mystery</option>
                            <option value="sci-fi">Sci-Fi</option>
                        </select>
                    </label>
                    <input type="submit" id="submit-query" value="Submit" />
                </form>
                <strong>
                    <span id="query"></span>
                </strong>
            </div>
            <p>or</p>
            <h3>Search for books by title, author, year, or genre.</h3>
            <div id="search-box">
                <form onChange={handleInputChange}>
                    <label>
                        ID:
                        <input type="text" name="id" />
                    </label>
                    <input type="submit" id="submit-id" value="Submit" />
                </form>
            </div>
        </div>
    );
}

export default Search;
