import { useEffect, useState } from "react";
import { AuthorRes, BookRes, Book } from "../../types";

const fetchData = async (request: Request) => {
    const response = (await fetch(request)) as Response;
    return await response.json();
};

const getAuthorName = (id: string, authors: AuthorRes[]) => {
    const author = authors.find((author) => author.id === id);
    return author ? author.name : "Unknown";
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
                {/* Table of books sorted alphabetically */}
                <table>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>id</th>
                            <th>Author (id)</th>
                            <th>Year</th>
                            <th>Genre</th>
                        </tr>
                    </thead>
                    <tbody>
                        {books
                            .sort((a, b) => a.title.localeCompare(b.title))
                            .map((book) => (
                                <tr key={book.id}>
                                    <td>{book.title}</td>
                                    <td>{book.id}</td>
                                    <td>{getAuthorName(book.author_id, authors)} ({book.author_id})</td>
                                    <td>{book.pub_year}</td>
                                    <td>{book.genre}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>    
            </div>
        );
    }
}