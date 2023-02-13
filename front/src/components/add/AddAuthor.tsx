import { Button, Table, TableCell } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import Tab from "@mui/material/Tab";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import TextField from "@mui/material/TextField";
import React from "react";
import { Link } from "react-router-dom";

interface AddAuthorProps {
    setUpdated: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AddAuthor = (props: AddAuthorProps) => {
    const [name, setName] = React.useState<string>("");
    const [bio, setBio] = React.useState<string>("");

    async function handleSubmitAuthor() {
        //make sure all fields non-empty
        if (!(name && bio)) {
            alert("Please fill out all fields");
            return;
        }
        const request = new Request("http://localhost:3000/api/authors", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                bio,
            }),
        });
        const response = (await fetch(request)) as Response;
        if (response.status === 201) {
            //reset form
            setName("");
            setBio("");
            alert("Author added successfully");
            props.setUpdated(true);
        } else {
            response.json().then((data) => {
                alert(
                    "Error adding author:\n" +
                        response.status +
                        "\t" +
                        data.error
                );
            });
        }
    }

    function handleInputChange(
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
        const target = event.target;
        const value = target.value;
        const name = target.name;

        if (name === "name") {
            setName(value);
        } else if (name === "bio") {
            setBio(value);
        }
    }

    return (
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableBody>
                <TableRow>
                    <TableCell width={"30%"} align="right">
                        <label htmlFor="name">Name</label>
                    </TableCell>
                    <TableCell width={"70%"}>
                        <FormControl>
                            <TextField
                                type="text"
                                id="name"
                                name="name"
                                value={name}
                                onChange={handleInputChange}
                            />
                        </FormControl>
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell align="right">
                        <label htmlFor="bio">Biography</label>
                    </TableCell>
                    <TableCell>
                        <FormControl>
                            <TextareaAutosize
                                id="bio"
                                name="bio"
                                value={bio}
                                onChange={handleInputChange}
                                cols={50}
                            />
                        </FormControl>
                    </TableCell>
                </TableRow>
                <TableRow>
                    <TableCell colSpan={2}>
                        <Button
                            variant="contained"
                            style={{ width: "100%", height: 40 }}
                            onClick={() => {
                                handleSubmitAuthor();
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
