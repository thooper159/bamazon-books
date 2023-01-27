import { AuthorRes, BookRes } from "../../types";

interface TableProps {
    books: BookRes[];
    authors: AuthorRes[];
}

const getAuthorName = (id: string, authors: AuthorRes[]) => {
    const author = authors.find((author) => author.id === id);
    return author ? author.name : "Unknown";
};

export const BookTable: React.FC<TableProps> = (props: TableProps) => {
    let books = props.books;
    let authors = props.authors;
    if (!Array.isArray(books)) {
        books = [books];
    }
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
                {books.length === 0 ? (
                    <tr>
                        <td colSpan={5}>No books found</td>
                    </tr>
                ) : (
                    books
                        .sort((a, b) => a.title.localeCompare(b.title))
                        .map((book) => (
                            <tr key={book.id}>
                                <td width={"35%"}>{book.title}</td>
                                <td width={"5%"}>{book.id}</td>
                                <td width={"25%"}>
                                    {getAuthorName(book.author_id, authors)} (
                                    {book.author_id})
                                </td>
                                <td width={"10%"}>{book.pub_year}</td>
                                <td width={"25%"}>{book.genre}</td>
                            </tr>
                        ))
                )}
            </tbody>
        </table>
    );
};
