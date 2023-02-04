import { Table, TableCell, TableRow } from "@mui/material";
import TableBody from "@mui/material/TableBody";
import TableHead from "@mui/material/TableHead";
import { AuthorRes, BookRes } from "../../types";

interface TableProps {
    authors: AuthorRes[];
}

export const AuthorTable: React.FC<TableProps> = (props: TableProps) => {
    let authors = props.authors;
    return (
        <Table sx={{ width: "80%" }}>
            <TableHead>
                <TableRow>
                    <TableCell>id</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Bio</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {authors.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={3}>No authors found</TableCell>
                    </TableRow>
                ) : (
                    authors.map((author) => (
                        <TableRow key={author.id}>
                            <TableCell width={"5%"}>{author.id}</TableCell>
                            <TableCell width={"25%"}>{author.name}</TableCell>
                            <TableCell width={"70%"}>{author.bio}</TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );
};
