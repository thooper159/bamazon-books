import { TableRow, TableBody } from "@mui/material";
import Table from "@mui/material/Table";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
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
        <Table sx={{ width: "80%" }}>
            <TableHead>
                <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>id</TableCell>
                    <TableCell>Author</TableCell>
                    <TableCell>Year</TableCell>
                    <TableCell>Genre</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {books.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5}>No books found</TableCell>
                    </TableRow>
                ) : (
                    books
                        .sort((a, b) => a.title.localeCompare(b.title))
                        .map((book) => (
                            <TableRow key={book.id}>
                                <TableCell width={"35%"}>
                                    {book.title}
                                </TableCell>
                                <TableCell width={"5%"}>{book.id}</TableCell>
                                <TableCell width={"25%"}>
                                    {getAuthorName(book.author_id, authors)}
                                </TableCell>
                                <TableCell width={"10%"}>
                                    {book.pub_year}
                                </TableCell>
                                <TableCell width={"25%"}>
                                    {book.genre}
                                </TableCell>
                            </TableRow>
                        ))
                )}
            </TableBody>
        </Table>
    );
};
