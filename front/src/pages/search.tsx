import React from "react";
import { Table } from "../components/booklist/table";
import { SearchResults } from "../components/search-results";
import { AuthorRes, BookRes } from "../types";

function Search() {
    const [title, setTitle] = React.useState<string>("");
    const [author_id, setAuthor] = React.useState<string>("");
    const [pub_year, setYear] = React.useState<string>("");
    const [genre, setGenre] = React.useState<string>("");
    const [id, setId] = React.useState<string>("");
    const [query, setQuery] = React.useState<string>("");
    const [books, setBooks] = React.useState<BookRes[]>([]);
    const [authors, setAuthors] = React.useState<AuthorRes[]>([]);
    const [error, setError] = React.useState<Error | null>(null);
    const [isLoaded, setIsLoaded] = React.useState<boolean>(false);

    React.useEffect(() => {
        getCurrentQuery();
    }, [title, author_id, pub_year, genre]);

    function handleInputChange(event: React.ChangeEvent<HTMLFormElement>) {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        if (name === "title") {
            setTitle(value);
        } else if (name === "author_id") {
            //validate input
            if(isNaN(value)){
                invalidateInput("author_id");
                setAuthor("");
            } else {
                validateInput("author_id");
                setAuthor(value);
            }
        } else if (name === "pub_year") {
            if(isNaN(value) || value.length > 4){
                invalidateInput("pub_year");
                setYear("");
            } else {
                validateInput("pub_year");
                setYear(value);
            }
        } else if (name === "genre") {
            setGenre(value);
        } else if (name === "id") {
            if(isNaN(value)){
                invalidateInput("id");
                setId("");
            } else {
                validateInput("id");
                setId(value);
            }
        }
    }

    function handleSubmit(event: React.SyntheticEvent): void {
        //get the generated query from event
        event.preventDefault();
        const params = new URLSearchParams({
            title: title,
            author_id: author_id,
            pub_year: pub_year,
            genre: genre,
        });
        //Referenced this article to remove empty params from URLSearchParams object
        //https://stackoverflow.com/questions/62989310/how-to-remove-empty-query-params-using-urlsearchparams
        let keysForDel: string[] = [];
        params.forEach((value, key) => {
        if (value == '') {
            keysForDel.push(key);
        }
        });

        keysForDel.forEach(key => {
            params.delete(key);
        });
        if(params.toString() === ""){
            setQuery("http://localhost:3000/api/books");
        } else {
            const queryBuilder = `http://localhost:3000/api/books?${params.toString()}`;
            console.log(queryBuilder);
            setQuery(queryBuilder);
        }
    }

    function handleSubmitId(event: React.SyntheticEvent): void {
        event.preventDefault();
        const queryBuilder = `http://localhost:3000/api/books/${id}`;
        console.log(queryBuilder);
        setQuery(queryBuilder);
    }

    function validateInput(input: string): void {
        document.getElementsByName(input)[0]!.style.backgroundColor = ""; 
    }
    function invalidateInput(input: string): void {
        document.getElementsByName(input)[0]!.style.backgroundColor = "lightcoral"; 
    }

    function getCurrentQuery(): void {
        let queryPreview: string = "Get all books";
        if (author_id) {
            queryPreview += ` by author_id ${author_id}`;
        }
        if (title) {
            queryPreview += ` with title ${title}`;
        }
        if (pub_year && pub_year !== "") {
            queryPreview += ` published in ${pub_year}`;
        }
        if (genre) {
            queryPreview += ` of genre ${genre}`;
        }
        //set p with id query to query
        document.getElementById("query-preview")!.innerHTML = queryPreview;
    }

    return (
        <div>
            <h3>Search for books by title, author_id, year, and/or genre.</h3>
            <div id="search-box">
                <form onChange={handleInputChange} onSubmit={handleSubmit}>
                    <label>
                        Title:
                        <input type="text" name="title" />
                    </label>
                    <br></br>
                    <label>
                        Author (id):
                        <input type="text" name="author_id" />
                    </label>
                    <br></br>
                    <label>
                        Year:
                        <input type="text" name="pub_year" />
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
                    <span id="query-preview"></span>
                </strong>
                <br />
                <br />
                <span id="query"></span>
            </div>
            <p>or</p>
            <h3>Search for books by title, author, year, or genre.</h3>
            <div id="search-box">
                <form onChange={handleInputChange} onSubmit={handleSubmitId}>
                    <label>
                        ID:
                        <input type="text" name="id" />
                    </label>
                    <input type="submit" id="submit-id" value="Submit" />
                </form>
            </div>
            <br />
            <br />
            <div id="search-results">
                <SearchResults query={query} />
            </div>
        </div>
    );
}

export default Search;
