import { AuthorRes, BookRes } from "../../types";

interface TableProps {
    authors: AuthorRes[];
}

export const AuthorTable: React.FC<TableProps> = (props: TableProps) => {
    let authors = props.authors;
    return (
        <table>
            <thead>
                <tr>
                    <th>id</th>
                    <th>Name</th>
                    <th>Bio</th>
                </tr>
            </thead>
            <tbody>
                {authors.length === 0 ? (
                    <tr>
                        <td colSpan={3}>No authors found</td>
                    </tr>
                ) : (
                    authors.map((author) => (
                        <tr key={author.id}>
                            <td width={"5%"}>{author.id}</td>
                            <td width={"25%"}>{author.name}</td>
                            <td width={"70%"}>{author.bio}</td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );
};
