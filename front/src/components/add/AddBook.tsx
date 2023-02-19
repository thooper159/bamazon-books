import {
    Button,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    TableCell,
    TableRow,
} from "@mui/material";
import FormControl from "@mui/material/FormControl";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableHead from "@mui/material/TableHead";
import TextField from "@mui/material/TextField";
import React from "react";
import { AuthorRes } from "../../types";
import { AuthContext } from "../../utils/AuthContext";

interface AddBookProps {
    authors: AuthorRes[];
}

export const AddBook = (props: AddBookProps) => {
    const [title, setTitle] = React.useState<string>("");
    const [author_id, setAuthor] = React.useState<string>("");
    const [pub_year, setYear] = React.useState<string>("");
    const [genre, setGenre] = React.useState<string>("");
    const [validTitle, setValidTitle] = React.useState<boolean>(false);
    const [validYear, setValidYear] = React.useState<boolean>(false);
    async function handleSubmitBook() {
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
            credentials: "include",
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

    function handleSelectChange(event: SelectChangeEvent) {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        if (name === "genre") {
            setGenre(value);
        } else if (name === "author_id") {
            setAuthor(value);
        }
    }

    function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        if (name === "title") {
            if (value.length > 0) {
                setTitle(value);
                setValidTitle(true);
            } else {
                setValidTitle(false);
                setTitle("");
            }
        } else if (name === "pub_year") {
            if (isNaN(+value) || value.length > 4) {
                setValidYear(false);
                setYear("");
            } else {
                setValidYear(true);
                setYear(value);
            }
        }
    }

    return (
        <Table sx={{ minWidth: 650 }}>
            <TableBody>
                <TableRow>
                    <TableCell width={"30%"} align="right">
                        <label htmlFor="title">Title</label>
                    </TableCell>
                    <TableCell width={"70%"}>
                        <FormControl>
                            <TextField
                                id="title"
                                name="title"
                                variant="outlined"
                                sx={{ minWidth: 500 }}
                                value={title}
                                onChange={handleInputChange}
                                error={!validTitle}
                            />
                        </FormControl>
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell align="right">
                        <label htmlFor="author_id">Author</label>
                    </TableCell>
                    <TableCell>
                        <FormControl>
                            <Select
                                name="author_id"
                                id="author_id"
                                value={author_id}
                                onChange={handleSelectChange}
                                defaultValue=""
                                displayEmpty
                            >
                                <MenuItem value="">
                                    <em>Select an author</em>
                                </MenuItem>
                                {props.authors.map((a) => (
                                    <MenuItem key={a.id} value={a.id}>
                                        {a.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell align="right">
                        <label htmlFor="pub_year">Year</label>
                    </TableCell>
                    <TableCell>
                        <FormControl>
                            <TextField
                                type="text"
                                id="pub_year"
                                name="pub_year"
                                value={pub_year}
                                onChange={handleInputChange}
                                error={!validYear}
                            />
                        </FormControl>
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell align="right">
                        <label htmlFor="genre">Genre</label>
                    </TableCell>
                    <TableCell>
                        <FormControl>
                            <Select
                                value={genre}
                                name="genre"
                                id="genre"
                                onChange={handleSelectChange}
                                inputProps={{ "aria-label": "Without label" }}
                                displayEmpty
                            >
                                <MenuItem value="">
                                    <em>Select a genre</em>
                                </MenuItem>
                                <MenuItem value={"dystopian"}>
                                    Dystopian
                                </MenuItem>
                                <MenuItem value={"romance"}>Romance</MenuItem>
                                <MenuItem value={"fantasy"}>Fantasy</MenuItem>
                                <MenuItem value={"horror"}>Horror</MenuItem>
                                <MenuItem value={"mystery"}>Mystery</MenuItem>
                                <MenuItem value={"sci-fi"}>Sci-Fi</MenuItem>
                            </Select>
                        </FormControl>
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell colSpan={2}>
                        <Button
                            variant="contained"
                            style={{ width: "100%", height: 40 }}
                            onClick={() => {
                                handleSubmitBook();
                            }}
                        >
                            Submit
                        </Button>
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    );
};
