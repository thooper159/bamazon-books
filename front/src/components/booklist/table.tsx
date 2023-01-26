import { AuthorRes, BookRes } from "../../types";


interface TableProps {
    books: BookRes[];
    authors: AuthorRes[];
}

const getAuthorName = (id: string, authors: AuthorRes[]) => {
    const author = authors.find((author) => author.id === id);
    return author ? author.name : "Unknown";
};

export const Table: React.FC<TableProps> = (props: TableProps) => {
    return (
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
                {props.books
                    .sort((a, b) => a.title.localeCompare(b.title))
                    .map((book) => (
                        <tr key={book.id}>
                            <td>{book.title}</td>
                            <td>{book.id}</td>
                            <td>
                                {getAuthorName(book.author_id, props.authors)} (
                                {book.author_id})
                            </td>
                            <td>{book.pub_year}</td>
                            <td>{book.genre}</td>
                        </tr>
                    ))}
            </tbody>
        </table>
    );
};
