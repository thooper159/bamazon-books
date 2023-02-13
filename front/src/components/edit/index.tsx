import * as React from "react";
import { DataGrid, GridColumns, GridRowsProp } from "@mui/x-data-grid";
import { AuthorRes, BookRes } from "../../types";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    MenuItem,
    Select,
    SelectChangeEvent,
    Table,
    TableBody,
    TableCell,
    TableRow,
    TextField,
} from "@mui/material";
import { title } from "process";
import { checkAuth } from "../../utils/auth";
import { Form, Navigate } from "react-router-dom";

interface EditBookProps {
    authors: AuthorRes[];
}

const fetchData = async (request: Request) => {
    const response = (await fetch(request)) as Response;
    return await response.json();
};

const sendRequest = async (request: Request) => {
    const response = (await fetch(request)) as Response;
    return await response;
};

export const EditBook = (props: EditBookProps) => {
    const [books, setBooks] = React.useState<BookRes[]>([]);
    const [error, setError] = React.useState<Error | null>(null);
    const [isLoaded, setIsLoaded] = React.useState<boolean>(false);
    const [reload, setReload] = React.useState<boolean>(false);
    const [deleteModalOpen, setDeleteModalOpen] =
        React.useState<boolean>(false);
    const [editModalOpen, setEditModalOpen] = React.useState<boolean>(false);
    const [selectedBook, setSelectedBook] = React.useState<BookRes>();

    const handleEditModalOpen = () => {
        setEditModalOpen(true);
    };

    const handleEditModalClose = () => {
        setEditModalOpen(false);
    };

    const handleDeleteModalOpen = () => {
        setDeleteModalOpen(true);
    };

    const handleDeleteModalClose = () => {
        setDeleteModalOpen(false);
    };

    React.useEffect(() => {
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
    }, [reload]);

    const handleDelete = async (id: string) => {
        const request = new Request(`http://localhost:3000/api/books/${id}`, {
            method: "DELETE",
            credentials: "include",
        });
        sendRequest(request)
            .then((result) => {
                setReload(!reload);
            })
            .catch((error) => {
                setError(error);
            });
    };

    const handleEdit = async (
        title: string,
        author_id: string,
        pub_year: string,
        genre: string,
        id: string
    ) => {
        const request = new Request(`http://localhost:3000/api/books/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title: title,
                author_id: author_id,
                pub_year: pub_year,
                genre: genre,
            }),
            credentials: "include",
        });
        sendRequest(request)
            .then((result) => {
                setReload(!reload);
            })
            .catch((error) => {
                setError(error);
            });
    };

    const columns: GridColumns = [
        { field: "id", headerName: "ID", width: 20, editable: false },
        { field: "title", headerName: "Title", width: 280, editable: false },
        {
            field: "author_id",
            headerName: "Author",
            width: 180,
            editable: false,
            valueGetter: (params) => {
                const author = props.authors.find(
                    (author) => author.id === params.row.author_id
                );
                return author?.name;
            },
        },
        { field: "pub_year", headerName: "Year", width: 100, editable: false },
        {
            field: "genre",
            headerName: "Genre",
            width: 130,
            editable: false,
        },
        {
            field: "edit",
            headerName: "",
            width: 180,
            disableReorder: true,
            filterable: false,
            sortable: false,
            editable: false,
            disableColumnMenu: true,
            renderCell: (params) => {
                return (
                    <div>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                setSelectedBook(params.row);
                                handleEditModalOpen();
                            }}
                        >
                            Edit
                        </Button>
                        {"    "}
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => {
                                setSelectedBook(params.row);
                                handleDeleteModalOpen();
                            }}
                        >
                            Delete
                        </Button>
                    </div>
                );
            },
        },
    ];

    const EditModal = () => {
        const [title, setTitle] = React.useState<string>();
        const [author_id, setAuthor] = React.useState<string>("");
        const [pub_year, setYear] = React.useState<string>("");
        const [genre, setGenre] = React.useState<string>("");
        const [validTitle, setValidTitle] = React.useState<boolean>(true);
        const [validYear, setValidYear] = React.useState<boolean>(true);

        React.useEffect(() => {
            if (selectedBook) {
                setTitle(selectedBook.title);
                setAuthor(selectedBook.author_id);
                setYear(selectedBook.pub_year);
                setGenre(selectedBook.genre);
            }
        }, [selectedBook]);

        function handleSelectChange(event: SelectChangeEvent) {
            const target = event.target;
            const value = target.value;
            const name = target.name;

            if (name === "genre") {
                setGenre(value);
            } else if (name === "author_id") {
                setAuthor(value);
            }
        }

        function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
            const target = event.target;
            const value = target.value;
            const name = target.name;

            if (name === "title") {
                if (value.length > 0) {
                    setTitle(value);
                    setValidTitle(true);
                } else {
                    setValidTitle(false);
                    setTitle("");
                }
            } else if (name === "pub_year") {
                if (isNaN(+value) || value.length > 4) {
                    setValidYear(false);
                    setYear("");
                } else {
                    setValidYear(true);
                    setYear(value);
                }
            }
        }
        return (
            <Dialog
                open={editModalOpen}
                onClose={handleEditModalClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                fullWidth={true}
                maxWidth={"lg"}
            >
                <DialogTitle id="alert-dialog-title">Edit Book</DialogTitle>
                <DialogContent>
                    {/* 
                        TODO:
                        this and the addBook component are pretty much the same, refactor!!!!
                    
                    */}
                    <Table sx={{ minWidth: 800 }}>
                        <TableBody>
                            <TableRow>
                                <TableCell width={"30%"} align="right">
                                    <label htmlFor="title">Title</label>
                                </TableCell>
                                <TableCell width={"70%"}>
                                    <FormControl>
                                        <TextField
                                            id="title"
                                            name="title"
                                            variant="outlined"
                                            sx={{ minWidth: 500 }}
                                            value={title}
                                            onChange={handleInputChange}
                                            error={!validTitle}
                                        />
                                    </FormControl>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="right">
                                    <label htmlFor="author_id">Author</label>
                                </TableCell>
                                <TableCell>
                                    <FormControl>
                                        <Select
                                            name="author_id"
                                            id="author_id"
                                            value={author_id}
                                            onChange={handleSelectChange}
                                            defaultValue=""
                                            displayEmpty
                                        >
                                            <MenuItem value="">
                                                <em>Select an author</em>
                                            </MenuItem>
                                            {props.authors.map((a) => (
                                                <MenuItem
                                                    key={a.id}
                                                    value={a.id}
                                                >
                                                    {a.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="right">
                                    <label htmlFor="pub_year">Year</label>
                                </TableCell>
                                <TableCell>
                                    <FormControl>
                                        <TextField
                                            type="text"
                                            id="pub_year"
                                            name="pub_year"
                                            value={pub_year}
                                            onChange={handleInputChange}
                                            error={!validYear}
                                        />
                                    </FormControl>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell align="right">
                                    <label htmlFor="genre">Genre</label>
                                </TableCell>
                                <TableCell>
                                    <FormControl>
                                        <Select
                                            value={genre}
                                            name="genre"
                                            id="genre"
                                            onChange={handleSelectChange}
                                            inputProps={{
                                                "aria-label": "Without label",
                                            }}
                                            displayEmpty
                                        >
                                            <MenuItem value="">
                                                <em>Select a genre</em>
                                            </MenuItem>
                                            <MenuItem value={"dystopian"}>
                                                Dystopian
                                            </MenuItem>
                                            <MenuItem value={"romance"}>
                                                Romance
                                            </MenuItem>
                                            <MenuItem value={"fantasy"}>
                                                Fantasy
                                            </MenuItem>
                                            <MenuItem value={"horror"}>
                                                Horror
                                            </MenuItem>
                                            <MenuItem value={"mystery"}>
                                                Mystery
                                            </MenuItem>
                                            <MenuItem value={"sci-fi"}>
                                                Sci-Fi
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                    <DialogActions>
                        <Button onClick={handleEditModalClose}>Cancel</Button>
                        <Button
                            variant="contained"
                            color="success"
                            onClick={() => {
                                if (
                                    !(title && author_id && pub_year && genre)
                                ) {
                                    alert("Please fill out all fields");
                                    return;
                                } else {
                                    handleEdit(
                                        title,
                                        author_id,
                                        pub_year,
                                        genre,
                                        selectedBook!.id
                                    );
                                    handleEditModalClose();
                                }
                            }}
                            autoFocus
                        >
                            Save
                        </Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>
        );
    };

    const DeleteModal = () => {
        return (
            <Dialog
                open={deleteModalOpen}
                onClose={handleDeleteModalClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Delete Book</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete this book?
                    </DialogContentText>
                    <DialogActions>
                        <Button onClick={handleDeleteModalClose}>Cancel</Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => {
                                handleDelete(selectedBook!.id);
                                handleDeleteModalClose();
                            }}
                            autoFocus
                        >
                            Delete
                        </Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>
        );
    };

    if (error) {
        return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
        return <div>Loading...</div>;
    } else {
        return (
            <div
                style={{
                    height: 700,
                    width: "70%",
                }}
            >
                <DataGrid
                    rows={books}
                    columns={columns}
                    experimentalFeatures={{ newEditingApi: true }}
                    style={{}}
                />
                <EditModal />
                <DeleteModal />
            </div>
        );
    }
};
