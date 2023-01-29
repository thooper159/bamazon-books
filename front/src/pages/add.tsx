import React from "react";
import { AddBook } from "../components/add/AddBook";
import { AddAuthor } from "../components/add/AddAuthor";
import { AuthorRes } from "../types";

const fetchData = async (request: Request) => {
    const response = (await fetch(request)) as Response;
    return await response.json();
};

function Add() {
    //get authors to see if author id is valid
    const [authors, setAuthors] = React.useState<AuthorRes[]>([]);
    const [error, setError] = React.useState<Error | null>(null);
    const [updated, setUpdated] = React.useState<boolean>(false);

      React.useEffect(() => {
        const request = new Request("http://localhost:3000/api/authors");
        fetchData(request)
            .then((result) => {
                setAuthors(result);
            })
            .catch((error) => {
                setError(error);
            });
    }, [updated]);

    return (
        <div className="row">
            <div className="column">
                <h1>Add a book</h1>
                <AddBook authors={authors} />
            </div>
            <div className="column">
                <h1>Add an author</h1>
                <AddAuthor setUpdated={setUpdated} />
            </div>
        </div>
    );
}

export default Add;
