import React from "react";
import { Link } from "react-router-dom";

interface AddAuthorProps {
    setUpdated: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AddAuthor = (props: AddAuthorProps) => {
    const [name, setName] = React.useState<string>("");
    const [bio, setBio] = React.useState<string>("");

    async function handleSubmitAuthor(event: React.SyntheticEvent) {
        event.preventDefault();
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
        <form onSubmit={handleSubmitAuthor}>
            <table>
                <tbody>
                    <tr>
                        <td width={"30%"}>
                            <label htmlFor="name">Name</label>
                        </td>
                        <td width={"70%"}>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={name}
                                onChange={handleInputChange}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <label htmlFor="bio">Biography</label>
                        </td>
                        <td>
                            <textarea
                                id="bio"
                                name="bio"
                                value={bio}
                                onChange={handleInputChange}
                                cols={50}
                                rows={2}
                            />
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
