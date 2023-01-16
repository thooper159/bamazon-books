import express, { Response } from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

let app = express();
app.use(express.json());

// create database "connection"
let db = await open({
    filename: "../database.db",
    driver: sqlite3.Database,
});
await db.get("PRAGMA foreign_keys = ON");

//
// SQLITE EXAMPLES
// comment these out or they'll keep inserting every time you run your server
// if you get 'UNIQUE constraint failed' errors it's because
// this will keep inserting a row with the same primary key
// but the primary key should be unique
//

// insert example
// await db.run(
//     "INSERT INTO authors(id, name, bio) VALUES('1', 'Figginsworth III', 'A traveling gentleman.')"
// );
// await db.run(
//     "INSERT INTO books(id, author_id, title, pub_year, genre) VALUES ('1', '1', 'My Fairest Lady', '1866', 'romance')"
// );

// insert example with parameterized queries
// important to use parameterized queries to prevent SQL injection
// when inserting untrusted data
// let statement = await db.prepare(
//     "INSERT INTO books(id, author_id, title, pub_year, genre) VALUES (?, ?, ?, ?, ?)"
// );
// await statement.bind(["2", "1", "A Travelogue of Tales", "1867", "adventure"]);
// await statement.run();

// select examples
let authors = await db.all("SELECT * FROM authors");
console.log("Authors", authors);
let books = await db.all("SELECT * FROM books");
console.log("Books", books);

//
// EXPRESS EXAMPLES
//

// GET/POST/DELETE example
interface Foo {
    message: string;
}

type FooResponse = Response<Foo | Error>;
// res's type limits what responses this request handler can send
// it must send either an object with a message or an error

// query params
app.get("/foo", (req, res: FooResponse) => {
    if (!req.query.bar) {
        return res.status(400).json({ error: "bar is required" });
    }
    return res.json({ message: `You sent: ${req.query.bar} in the query` });
});

// body example
app.post("/foo", (req, res: FooResponse) => {
    if (!req.body.bar) {
        return res.status(400).json({ error: "bar is required" });
    }
    return res.json({ message: `You sent: ${req.body.bar} in the body` });
});
app.delete("/foo", (req, res) => {
    // etc.
    res.sendStatus(200);
});

// POST, GET, DELETE rquests to create, fetch, and delete resources

type Book = {
    author_id: string;
    title: string;
    pub_year: string;
    genre:
        | "adventure"
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

app.get("/books", async (req, res: BookResponse) => {
    let numParams = Object.keys(req.query).length;
    let books;
    let params = [];
    let query = "SELECT * FROM books";

    if (numParams === 0) {
        books = await db.all(query);
    }
    //add all the query params to the query
    else {
        query += " WHERE ";
        //iterate through query params if they are valid
        for (let key in req.query) {
            if (
                key === "author_id" ||
                key === "pub_year" ||
                key === "genre" ||
                key === "title" ||
                key === "id"
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
        console.log(query, params);
        books = await db.all(query, params);
    }
    if (!books) {
        return res.status(204).json({ error: "No books found" });
    } else {
        return res.json(books);
    }
});

app.post("/books", async (req, res: BookResponse) => {
    //make sure req body is type Book
    if (
        !req.body.author_id ||
        !req.body.title ||
        !req.body.pub_year ||
        !req.body.genre
    ) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    //make sure genre is valid
    if (
        !(
            req.body.genre === "adventure" ||
            req.body.genre === "romance" ||
            req.body.genre === "horror" ||
            req.body.genre === "mystery" ||
            req.body.genre === "fantasy" ||
            req.body.genre === "sci-fi"
        )
    ) {
        return res.status(400).json({ error: "Invalid genre" });
    }

    //make sure book with same title and year and author doesnt already exist
    let book = await db.get(
        "SELECT * FROM books WHERE title = ? AND pub_year = ? AND author_id = ?",
        [req.body.title, req.body.pub_year, req.body.author_id]
    );

    console.log("Checking for book... ", book);
    if (book) {
        return res.status(400).json({ error: "Book already exists" });
    }
    //make sure author exists
    let author = await db.get("SELECT * FROM authors WHERE id = ?", [
        req.body.author_id,
    ]);
    console.log("Checking for author... ", author);
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
    return res.status(201).json([book]);
});

app.delete("/books", async (req, res: BookResponse) => {
    if (!req.query.id) {
        return res.status(400).json({ error: "Id is required" });
    }
    let book = await db.get("SELECT * FROM books WHERE id = ?", [req.query.id]);
    if (!book) {
        return res.status(400).json({ error: "Book does not exist" });
    }
    await db.run("DELETE FROM books WHERE id = ?", [req.query.id]);
    return res.sendStatus(200);
});

app.get("/authors", async (req, res: AuthorResponse) => {
    let authors;
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
        } else if (req.query.id) {
            authors = await db.all("SELECT * FROM authors WHERE id = ?", [
                req.query.id,
            ]);
        } else {
            authors = await db.all("SELECT * FROM authors");
        }
    }

    if (!authors) {
        return res.status(204).json({ error: "No authors found" });
    } else {
        return res.json(authors);
    }
});

app.post("/authors", async (req, res: AuthorResponse) => {
    //make sure all fields are present
    if (!req.body.name || !req.body.bio) {
        return res.status(400).json({ error: "Missing fields" });
    }
    //make sure author doesn't already exist
    let author = await db.get("SELECT * FROM authors WHERE name = ?", [
        req.body.name,
    ]);
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
    return res.status(201).json([author]);
});

// GET requests to fetch a single book / author by ID and all books / authors

// Using query strings with GET requests to filter along at least one book or
// author property, eg searching for all books published on or aftera  certain year

//
// ASYNC/AWAIT EXAMPLE
//

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
// need async keyword on request handler to use await inside it
app.get("/bar", async (req, res: FooResponse) => {
    console.log("Waiting...");
    // await is equivalent to calling sleep.then(() => { ... })
    // and putting all the code after this in that func body ^
    await sleep(3000);
    // if we omitted the await, all of this code would execute
    // immediately without waiting for the sleep to finish
    console.log("Done!");
    return res.sendStatus(200);
});
// test it out! while server is running:
// curl http://localhost:3000/bar

// run server
let port = 3000;
let host = "localhost";
let protocol = "http";
app.listen(port, host, () => {
    console.log(`${protocol}://${host}:${port}`);
});
