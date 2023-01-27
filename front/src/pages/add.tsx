import React from "react";
import { AuthorRes } from "../types";

const fetchData = async (request: Request) => {
    const response = (await fetch(request)) as Response;
    return await response.json();
};

function Add() {
    const [title, setTitle] = React.useState<string>("");
    const [author_id, setAuthor] = React.useState<string>("");
    const [pub_year, setYear] = React.useState<string>("");
    const [genre, setGenre] = React.useState<string>("");
    //get authors to see if author id is valid
    const [authors, setAuthors] = React.useState<AuthorRes[]>([]);
    const [error, setError] = React.useState<Error | null>(null);

    React.useEffect(() => {
        const request = new Request("http://localhost:3000/api/authors");
        fetchData(request)
            .then((result) => {
                setAuthors(result);
            })
            .catch((error) => {
                setError(error);
            });
    }, []);

    function validateInput(input: string): void {
        document.getElementsByName(input)[0]!.style.backgroundColor = ""; 
    }
    function invalidateInput(input: string): void {
        document.getElementsByName(input)[0]!.style.backgroundColor = "lightcoral"; 
    }
    function handleSubmitBook(event: React.SyntheticEvent): void {
        event.preventDefault();
    }

    function handleSelectChange(event: React.ChangeEvent<HTMLSelectElement>) {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        if (name === "genre") {
            setGenre(value);
        }
    }

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        if (name === "title") {
            setTitle(value);
        } else if (name === "author_id") {
            //validate input
            //check if value is an integer

            if(!isNaN(+value) && Number(value) <= authors.length){
                validateInput("author_id");
                setAuthor(value);
            } else {
                console.log(authors.length)
                invalidateInput("author_id");
                setAuthor("");
            }
        } else if (name === "pub_year") {
            if(isNaN(+value) || value.length > 4){
                invalidateInput("pub_year");
                setYear("");
            } else {
                validateInput("pub_year");
                setYear(value);
            }
        }
    }

    return (
        <div className="row">
            <div className="column">
                <h1>Add a book</h1>
                <form onSubmit={handleSubmitBook}>
                <table>
                    <tbody>
                        <tr>
                            <td width={"30%"}>
                            <label htmlFor="title">Title</label>
                            </td>
                            <td width={"70%"}>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={title}
                        onChange={handleInputChange}
                    />
                    </td>
                    </tr>
                    <tr>
                            <td>
                    <label htmlFor="author_id">Author (id)</label>
                    </td>
                    <td>

                    <input
                        type="text"
                        id="author_id"
                        name="author_id"
                        value={author_id}
                        onChange={handleInputChange}
                    />
                    </td>
                    </tr>
                    <tr>
                            <td>
                    <label htmlFor="pub_year">Year</label>
                    </td>
                    <td>
                        
                    <input
                        type="text"
                        id="pub_year"
                        name="pub_year"
                        value={pub_year}
                        onChange={handleInputChange}

                    />
                    </td>
                    </tr>
                    <tr>
                            <td>
                    <label htmlFor="genre">Genre</label>
                    </td>
                    <td>
                        <select name="genre" id="genre" value={genre} onChange={handleSelectChange} >
                            <option value="dystopian">Dystopian</option>
                            <option value="romance">Romance</option>
                            <option value="fantasy">Fantasy</option>
                            <option value="horror">Horror</option>
                            <option value="mystery">Mystery</option>
                            <option value="sci-fi">Sci-Fi</option>
                        </select>
                    </td>
                    </tr>
                    <tr>
                            <td colSpan={2}>
                    <input type="submit" value="Submit" />
                    </td>
                    </tr>
                    </tbody>

                    </table>
                </form>
            </div>
            <div className="column">
                <h1>Add an author</h1>
            </div>
        </div>
    );
}

export default Add;
