import {
    FormControl,
    Button,
    Table,
    TableBody,
    TableCell,
    TableRow,
    MenuItem,
    Select,
    TextField,
} from "@mui/material";
import Tab from "@mui/material/Tab";
import React from "react";
import { Link } from "react-router-dom";
import { SearchResults } from "../components/search-results";
import { AuthorRes, BookRes } from "../types";

const fetchData = async (request: Request) => {
    const response = (await fetch(request)) as Response;
    return await response.json();
};

function Search() {
    const [title, setTitle] = React.useState<string>("");
    const [author_id, setAuthor] = React.useState<string>("");
    const [pub_year, setYear] = React.useState<string>("");
    const [validYear, setValidYear] = React.useState<boolean>(true);
    const [genre, setGenre] = React.useState<string>("");
    const [id, setId] = React.useState<string>("");
    const [validId, setValidId] = React.useState<boolean>(true);
    const [query, setQuery] = React.useState<string>("");
    const [authors, setAuthors] = React.useState<AuthorRes[]>([]);

    React.useEffect(() => {
        const request = new Request("http://localhost:3000/api/authors");
        fetchData(request)
            .then((result) => {
                setAuthors(result);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    React.useEffect(() => {
        getCurrentQuery();
    }, [title, author_id, pub_year, genre]);

    function handleInputChange(event: any) {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        if (name === "title") {
            setTitle(value);
        } else if (name === "author_id") {
            setAuthor(value);
        } else if (name === "pub_year") {
            if (isNaN(value) || value.length > 4) {
                setValidYear(false);
                setYear("");
            } else {
                setValidYear(true);
                setYear(value);
            }
        } else if (name === "genre") {
            setGenre(value);
        } else if (name === "id") {
            if (isNaN(value)) {
                setValidId(false);
                setId("");
            } else {
                setValidId(true);
                setId(value);
            }
        }
    }

    function handleSubmit(): void {
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
            if (value === "") {
                keysForDel.push(key);
            }
        });

        keysForDel.forEach((key) => {
            params.delete(key);
        });
        if (params.toString() === "") {
            setQuery("http://localhost:3000/api/books");
        } else {
            const queryBuilder = `http://localhost:3000/api/books?${params.toString()}`;
            setQuery(queryBuilder);
        }
    }

    function handleSubmitId(): void {
        const queryBuilder = `http://localhost:3000/api/books/${id}`;
        setQuery(queryBuilder);
    }

    function getCurrentQuery(): void {
        let queryPreview: string = "Get all books";
        if (author_id) {
            queryPreview += ` by ` + authors[parseInt(author_id) - 1].name;
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
        <div className="row">
            <br />
            <div id="search-box" className="column">
                <b>Search for books by title, author_id, year, and/or genre.</b>
                <FormControl fullWidth>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell width={"30%"} align="right">
                                    <label>Title</label>
                                </TableCell>
                                <TableCell width={"70%"}>
                                    <TextField
                                        type="text"
                                        name="title"
                                        value={title}
                                        onChange={handleInputChange}
                                    />
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="right">
                                    <label>Author</label>
                                </TableCell>
                                <TableCell>
                                    {/* <input type="text" name="author_id" /> */}
                                    <Select
                                        name="author_id"
                                        id="author_id"
                                        value={author_id}
                                        onChange={handleInputChange}
                                        defaultValue=""
                                        displayEmpty
                                    >
                                        <MenuItem value=""><em>Select an author</em></MenuItem>
                                        {authors.map((author) => (
                                            <MenuItem
                                                key={author.id}
                                                value={author.id}
                                            >
                                                {author.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="right">
                                    <label>Year</label>
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        type="text"
                                        name="pub_year"
                                        onChange={handleInputChange}
                                        error={!validYear}
                                    />
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="right">
                                    <label>Genre</label>
                                </TableCell>
                                <TableCell>
                                    <Select
                                        name="genre"
                                        value={genre}
                                        id="genre"
                                        onChange={handleInputChange}
                                        displayEmpty
                                    >
                                        <MenuItem value="">
                                            <em>Select a genre</em>
                                        </MenuItem>
                                        <MenuItem value="dystopian">
                                            Dystopian
                                        </MenuItem>
                                        <MenuItem value="romance">
                                            Romance
                                        </MenuItem>
                                        <MenuItem value="fantasy">
                                            Fantasy
                                        </MenuItem>
                                        <MenuItem value="horror">
                                            Horror
                                        </MenuItem>
                                        <MenuItem value="mystery">
                                            Mystery
                                        </MenuItem>
                                        <MenuItem value="sci-fi">
                                            Sci-Fi
                                        </MenuItem>
                                    </Select>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={2} align="center">
                                    <strong>
                                        <span id="query-preview"></span>
                                    </strong>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={2}>
                                    <Button
                                        style={{ width: "100%", height: 40 }}
                                        onClick={() => handleSubmit()}
                                        variant="contained"
                                    >
                                        Search
                                    </Button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                    <br />
                </FormControl>
                <b> -- or --</b>
                <br />
                <br />
                <b>Search for book by id</b>
                <div id="search-box">
                    <FormControl fullWidth>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell>
                                        <label>ID</label>
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            onChange={handleInputChange}
                                            type="text"
                                            name="id"
                                            error={!validId}
                                        />
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                        <Button
                            variant="contained"
                            style={{ width: "100%", height: 40 }}
                            onClick={() => handleSubmitId()}
                        >
                            Search
                        </Button>
                    </FormControl>
                </div>
            </div>

            <br />
            <br />
            <div id="search-results" className="column">
                <br />
                <SearchResults query={query} authors={authors} />
            </div>
        </div>
    );
}

export default Search;
