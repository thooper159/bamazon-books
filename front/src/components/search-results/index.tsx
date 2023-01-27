import { useEffect, useState } from "react";
import { AuthorRes, BookRes } from "../../types";
import { BookTable } from "../library/BookTable";

export interface SearchResultsProps {
    query: string;
}

export function SearchResults(props: SearchResultsProps): JSX.Element {
    const [error, setError] = useState<Error | null>(null);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [books, setBooks] = useState<BookRes[]>([]);
    const [authors, setAuthors] = useState<AuthorRes[]>([]);

    const fetchData = async (request: Request) => {
        const response = (await fetch(request)) as Response;
        return await response.json();
    };

    useEffect(() => {
        const request = new Request("http://localhost:3000/api/authors");
        fetchData(request)
            .then((result) => {
                setAuthors(result);
            })
            .catch((error) => {
                setError(error);
            });
    }, []);

    useEffect(() => {
        setError(null);
        const request = new Request(props.query);
        fetchData(request)
            .then((result) => {
                setIsLoaded(true);
                setBooks(result);
            })
            .catch((error) => {
                setIsLoaded(true);
                setError(error);
            });
    }, [props.query]);

    if (props.query === "") {
        return <div></div>;
    } else if (error) {
        return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
        return <div>Loading...</div>;
    } else {
        return (
            <div>
                <BookTable books={books} authors={authors} />
            </div>
        );
    }
}
