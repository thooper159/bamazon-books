import React from "react";
import { Link } from "react-router-dom";
import { AuthorRes } from "../../types";

interface AddBookProps {
    authors: AuthorRes[];
}

export const AddBook = (props: AddBookProps) => {
    const [title, setTitle] = React.useState<string>("");
    const [author_id, setAuthor] = React.useState<string>("");
    const [pub_year, setYear] = React.useState<string>("");
    const [genre, setGenre] = React.useState<string>("");

    function validateInput(input: string): void {
        document.getElementsByName(input)[0]!.style.backgroundColor = "";
    }
    function invalidateInput(input: string): void {
        document.getElementsByName(input)[0]!.style.backgroundColor =
            "lightcoral";
    }
    async function handleSubmitBook(event: React.SyntheticEvent) {
        event.preventDefault();
        if (!(title && author_id && pub_year && genre)) {
            alert("Please fill out all fields");
            return;
        }
        const request = new Request("http://localhost:3000/api/books", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title,
                author_id,
                pub_year,
                genre,
            }),
        });
        const response = (await fetch(request)) as Response;
        if (response.status === 201) {
            //reset form
            setTitle("");
            setAuthor("");
            setYear("");
            setGenre("");
            alert("Book added successfully");
        } else {
            response.json().then((data) => {
                alert(
                    "Error adding book:\n" + response.status + "\t" + data.error
                );
            });
        }
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

            if (!isNaN(+value) && Number(value) <= props.authors.length) {
                validateInput("author_id");
                setAuthor(value);
            } else {
                invalidateInput("author_id");
                setAuthor("");
            }
        } else if (name === "pub_year") {
            if (isNaN(+value) || value.length > 4) {
                invalidateInput("pub_year");
                setYear("");
            } else {
                validateInput("pub_year");
                setYear(value);
            }
        }
    }

    return (
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
                            <label htmlFor="author_id">
                                Author (id){" "}
                                <Link to={"/library#props.authors"}>
                                    (Reference)
                                </Link>
                            </label>
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
                            <select
                                name="genre"
                                id="genre"
                                value={genre}
                                onChange={handleSelectChange}
                            >
                                <option value="">Select a genre</option>
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
                            <input
                                type="submit"
                                value="Submit"
                                style={{ width: "100%", height: 40 }}
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
        </form>
    );
};
