import { useEffect, useState } from "react";
import { AuthorRes, BookRes } from "../../types";
import { AuthorTable } from "./authors";
import { Table} from "./table";

const fetchData = async (request: Request) => {
    const response = (await fetch(request)) as Response;
    return await response.json();
};

export function BookList(): JSX.Element {
    const [error, setError] = useState<Error | null>(null);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [books, setBooks] = useState<BookRes[]>([]);
    const [authors, setAuthors] = useState<AuthorRes[]>([]);

    useEffect(() => {
        const request = new Request("http://localhost:3000/api/books");
        fetchData(request)
            .then((result) => {
                setIsLoaded(true);
                setBooks(result);
            })
            .catch((error) => {
                setIsLoaded(true);
                setError(error);
            });
    }, []);

    useEffect(() => {
        const request = new Request("http://localhost:3000/api/authors");
        fetchData(request)
            .then((result) => {
                setIsLoaded(true);
                setAuthors(result);
            })
            .catch((error) => {
                setIsLoaded(true);
                setError(error);
            });
    }, []);

    if (error) {
        return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
        return <div>Loading...</div>;
    } else {
        return (
            <div>
                <h2>Books</h2>
                <Table books={books} authors={authors}  />
                <h2>Authors</h2>
                <AuthorTable authors={authors} />
            </div>
        );
    }
}