import React from "react";
import { EditBook } from "../components/edit";
import { AuthorRes } from "../types";

const fetchData = async (request: Request) => {
    const response = (await fetch(request)) as Response;
    return await response.json();
};

function Edit() {
    const endpoint = process.env.REACT_APP_API_ENDPOINT;
    const [authors, setAuthors] = React.useState<AuthorRes[]>([]);
    const [error, setError] = React.useState<Error | null>(null);
    const [updated, setUpdated] = React.useState<boolean>(false);

    React.useEffect(() => {
        const request = new Request(endpoint + "/api/authors");
        fetchData(request)
            .then((result) => {
                setAuthors(result);
            })
            .catch((error) => {
                setError(error);
            });
    }, [updated]);

    return (
        <>
            <div>
                <h1>Edit</h1>
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
                <EditBook authors={authors} />
            </div>
        </>
    );
}

export default Edit;
