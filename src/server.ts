import express, { Response } from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";

let app = express();
app.use(express.json());
app.use(express.static("public"));

//allow cross origin requests
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});
// create database "connection"
let db = await open({
    filename: "../database.db",
    driver: sqlite3.Database,
});
await db.get("PRAGMA foreign_keys = ON");

await db.exec("DELETE FROM books");
await db.exec("DELETE FROM authors");

await db.exec(
    "INSERT INTO authors(id, name, bio) VALUES(1, 'Ayn Rand', 'A Russian-born American writer and philosopher')"
);
await db.exec(
    "INSERT INTO authors(id, name, bio) VALUES(2, 'J.R.R. Tolkien', 'An English writer, poet, philologist, and university professor')"
);
await db.exec(
    "INSERT INTO authors(id, name, bio) VALUES(3, 'J.K. Rowling', 'A British author, philanthropist, film producer, television producer, and screenwriter')"
);
await db.exec(
    "INSERT INTO authors(id, name, bio) VALUES(4, 'Stephen King', 'An American author of horror, supernatural fiction, suspense, science fiction, and fantasy')"
);
await db.exec(
    "INSERT INTO books(id, author_id, title, pub_year, genre) VALUES (1, 1, 'Anthem', '1938','dystopian')"
);
await db.exec(
    "INSERT INTO books(id, author_id, title, pub_year, genre) VALUES (2, 2, 'The Hobbit', '1937','fantasy')"
);
await db.exec(
    "INSERT INTO books(id, author_id, title, pub_year, genre) VALUES (3, 3, 'Harry Potter and the Sorcerer''s Stone', '1997','fantasy')"
);
await db.exec(
    "INSERT INTO books(id, author_id, title, pub_year, genre) VALUES (4, 3, 'Harry Potter and the Chamber of Secrets', '1998','fantasy')"
);
await db.exec(
    "INSERT INTO books(id, author_id, title, pub_year, genre) VALUES (5, 4, 'The Shining', '1977','horror')"
);
await db.exec(
    "INSERT INTO books(id, author_id, title, pub_year, genre) VALUES (6, 4, 'It', '1986','horror')"
);
await db.exec(
    "INSERT INTO books(id, author_id, title, pub_year, genre) VALUES (7, 4, 'The Green Mile', '1996','mystery')"
);

type Book = {
    author_id: string;
    title: string;
    pub_year: string;
    genre:
        | "dystopian"
        | "romance"
        | "horror"
        | "mystery"
        | "fantasy"
        | "sci-fi";
};
type BookRow = { id: string } & Book;

type Author = {
    name: string;
    bio: string;
};
type AuthorRow = { id: string } & Author;

interface Error {
    error: string;
}
type BookResponse = Response<BookRow[] | Error>;

type AuthorResponse = Response<AuthorRow[] | Error>;

app.get("/api/books", async (req, res: BookResponse) => {
    let numParams = Object.keys(req.query).length;
    let books: BookRow[];
    let params = [];
    let query = "SELECT * FROM books";

    if (numParams === 0) {
        books = await db.all(query);
    }
    //add all the query params to the query
    else if (numParams > 4) {
        return res.status(400).json({ error: "Too many query params" });
    } else {
        query += " WHERE ";
        //iterate through query params if they are valid
        for (let key in req.query) {
            if (
                key === "author_id" ||
                key === "pub_year" ||
                key === "genre" ||
                key === "title"
            ) {
                query += `${key} = ? AND `;
                params.push(req.query[key]);
            } else {
                return res
                    .status(400)
                    .json({ error: "Invalid query param: " + key });
            }
        }
        //remove the last AND
        query = query.slice(0, -5);
        books = await db.all(query, params);
    }
    if (!books) {
        return res.status(204).json({ error: "No books found" });
    } else {
        return res.json(books);
    }
});

app.get("/api/books/:id", async (req, res: BookResponse) => {
    //validate id is a number
    if (isNaN(Number(req.params.id))) {
        return res.status(400).json({ error: "Invalid book id" });
    }
    let book = await db.get("SELECT * FROM books WHERE id = ?", [
        req.params.id,
    ]);
    if (!book) {
        return res.status(404).json({ error: "Book not found" });
    } else {
        return res.json(book);
    }
});

app.post("/api/books", async (req, res: BookResponse) => {
    //make sure req body is type Book
    //make sure req body matches Book type

    if (!req.body.author_id) {
        return res.status(400).json({ error: "Missing author_id" });
    }
    if (!req.body.title) {
        return res.status(400).json({ error: "Missing title" });
    }
    if (!req.body.pub_year) {
        return res.status(400).json({ error: "Missing pub_year" });
    }
    if (!req.body.genre) {
        return res.status(400).json({ error: "Missing genre" });
    }

    //make sure genre is valid
    if (
        !(
            req.body.genre === "dystopian" ||
            req.body.genre === "romance" ||
            req.body.genre === "horror" ||
            req.body.genre === "mystery" ||
            req.body.genre === "fantasy" ||
            req.body.genre === "sci-fi"
        )
    ) {
        return res.status(400).json({ error: "Invalid genre" });
    }

    //make sure pub_year is a year (CE years only, BCE coming soon)
    if (isNaN(Number(req.body.pub_year))) {
        return res.status(400).json({ error: "Invalid pub_year" });
    }

    //make sure book with same title and year and author doesnt already exist
    let book: BookRow[] | undefined = await db.get(
        "SELECT * FROM books WHERE title = ? AND pub_year = ? AND author_id = ?",
        [req.body.title, req.body.pub_year, req.body.author_id]
    );

    if (book) {
        return res.status(400).json({ error: "Book already exists" });
    }
    //make sure author exists
    let author: AuthorRow[] | undefined = await db.get(
        "SELECT * FROM authors WHERE id = ?",
        [req.body.author_id]
    );
    if (!author) {
        return res.status(400).json({ error: "Author does not exist" });
    }

    //insert book
    let statement = await db.prepare(
        "INSERT INTO books(id, author_id, title, pub_year, genre) VALUES (?, ?, ?, ?, ?)"
    );
    //get next id
    let id = await db.get("SELECT MAX(id) FROM books");
    id = id["MAX(id)"] + 1;
    await statement.bind([
        id,
        req.body.author_id,
        req.body.title,
        req.body.pub_year,
        req.body.genre,
    ]);
    await statement.run();
    //return book just created
    book = await db.get("SELECT * FROM books WHERE id = ?", [id]);
    return res.status(201).json(book);
});

app.delete("/api/books", async (req, res: BookResponse) => {
    return res
        .status(405)
        .json({ error: "Method not allowed. Id must be specified" });
});
app.delete("/api/books/:id", async (req, res: BookResponse) => {
    if (!req.params.id) {
        return res.status(400).json({ error: "Id is required" });
    }
    if (isNaN(Number(req.params.id))) {
        return res.status(400).json({ error: "Invalid id" });
    }

    let book: BookRow[] | undefined = await db.get(
        "SELECT * FROM books WHERE id = ?",
        [req.params.id]
    );
    if (!book) {
        return res.status(404).json({ error: "Book not found" });
    }
    await db.run("DELETE FROM books WHERE id = ?", [req.params.id]);
    return res.sendStatus(200);
});

app.get("/api/authors", async (req, res: AuthorResponse) => {
    let authors: AuthorRow[];
    let numParams = Object.keys(req.query).length;

    if (numParams === 0) {
        authors = await db.all("SELECT * FROM authors");
    } else if (numParams > 1) {
        return res.status(400).json({ error: "Too many query params" });
    } else {
        if (req.query.name) {
            authors = await db.all("SELECT * FROM authors WHERE name = ?", [
                req.query.name,
            ]);
        } else {
            return res.status(400).json({ error: "Invalid query param" });
        }
    }

    if (!authors) {
        return res.status(204).json({ error: "No authors found" });
    } else {
        return res.json(authors);
    }
});

app.get("/api/authors/:id", async (req, res: AuthorResponse) => {
    if (isNaN(Number(req.params.id))) {
        return res.status(400).json({ error: "Invalid author id" });
    }
    let author: AuthorRow[] | undefined = await db.get(
        "SELECT * FROM authors WHERE id = ?",
        [req.params.id]
    );
    if (!author) {
        return res.status(404).json({ error: "Author not found" });
    } else {
        return res.json(author);
    }
});

app.post("/api/authors", async (req, res: AuthorResponse) => {
    //make sure all fields are present
    if (!req.body.name) {
        return res.status(400).json({ error: "Missing name" });
    }
    if (!req.body.bio) {
        return res.status(400).json({ error: "Missing bio" });
    }
    //make sure author doesn't already exist
    let author: AuthorRow[] | undefined = await db.get(
        "SELECT * FROM authors WHERE name = ?",
        [req.body.name]
    );
    if (author) {
        return res.status(400).json({ error: "Author already exists" });
    }
    //insert author
    let statement = await db.prepare(
        "INSERT INTO authors(id, name, bio) VALUES (?, ?, ?)"
    );
    //get next id
    let id = await db.get("SELECT MAX(id) FROM authors");
    id = id["MAX(id)"] + 1;
    await statement.bind([id, req.body.name, req.body.bio]);
    await statement.run();
    //return author just created
    author = await db.get("SELECT * FROM authors WHERE id = ?", [id]);
    return res.status(201).json(author);
});

app.delete("/api/authors", async (req, res: BookResponse) => {
    return res
        .status(405)
        .json({ error: "Method not allowed. Id must be specified" });
});

app.delete("/api/authors/:id", async (req, res: BookResponse) => {
    if (isNaN(Number(req.params.id))) {
        return res.status(400).json({ error: "Invalid id" });
    }

    let author = await db.get("SELECT * FROM authors WHERE id = ?", [
        req.params.id,
    ]);
    if (!author) {
        return res.status(404).json({ error: "Author not found" });
    }
    //check if author has any books
    let books = await db.all("SELECT * FROM books WHERE author_id = ?", [
        req.query.id,
    ]);
    if (books.length > 0) {
        return res
            .status(400)
            .json({ error: "Cannot delete, author has books" });
    }
    await db.run("DELETE FROM books WHERE id = ?", [req.params.id]);
    return res.sendStatus(200);
});

// run server
let port = 3000;
let host = "localhost";
let protocol = "http";
app.listen(port, host, () => {
    console.log(`${protocol}://${host}:${port}`);
});
