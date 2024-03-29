import express, { CookieOptions, RequestHandler, Response } from "express";
import {
    BookRow,
    BookResponse,
    Error,
    AuthorRow,
    AuthorResponse,
    Genres,
    ID,
} from "./types.js";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { fileURLToPath } from "url";
import path from "path";
import { ParamsDictionary, Request } from "express-serve-static-core";
import { ParsedQs } from "qs";
import cookieParser from "cookie-parser";
import cors from "cors";
import { z } from "zod";
import { randomBytes } from "crypto";
import argon2 from "argon2";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let app = express();

app.use(helmet());
//add 	Permissions Policy header
app.use(
    helmet.permittedCrossDomainPolicies({
        permittedPolicies: "none",
    })
);

app.use(express.static(path.join(__dirname, "public")));

//allow cross origin requests
// app.use(function (req, res, next) {
//     //allow GET, POST, PUT, DELETE, OPTIONS
//     res.header(
//         "Access-Control-Allow-Methods",
//         "GET, POST, PUT, DELETE, OPTIONS"
//     );
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header(
//         "Access-Control-Allow-Headers",
//         "Origin, X-Requested-With, Content-Type, Accept"
//     );
//     next();
// });
app.use(
    cors({
        origin: ["http://localhost:3000", "http://localhost:3001"],
        credentials: true,
    })
);
app.use(cookieParser());
app.use(express.json());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    handler: function (req, res, next) {
        console.log(`IP ${req.ip} has been rate limited`);
        res.status(429).send(
            "Too many requests from this IP, please try again later."
        );
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use("/api", limiter);

// create database "connection"
let db = await open({
    filename: "../database.db",
    driver: sqlite3.Database,
});
await db.get("PRAGMA foreign_keys = ON");

let loginSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
});

function makeToken() {
    return randomBytes(32).toString("hex");
}

let tokenStorage: { [key: string]: { username: string } } = {};

let cookieOptions: CookieOptions = {
    httpOnly: true, //
    secure: true,
    sameSite: "strict",
};

let authorize: RequestHandler = (req, res, next) => {
    let { token }: { token: string } = req.cookies;
    // console.log(token);
    if (token === undefined) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    if (!tokenStorage.hasOwnProperty(token)) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    next();
};

app.post("/api/login", async function login(req: Request, res: Response) {
    let parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
        return res.status(400).json({ error: "Username or password invalid" });
    }
    let { username, password } = parseResult.data;
    let user = await db.get("SELECT * FROM users WHERE username = ?", username);
    if (user === undefined) {
        return res.status(400).json({ error: "Username or password invalid" });
    }
    let valid = await argon2.verify(user.password, password);
    if (!valid) {
        return res.status(400).json({ error: "Username or password invalid" });
    }
    let token = makeToken();
    // console.log(token);
    tokenStorage[token] = { username };
    // console.log(tokenStorage);
    res.cookie("token", token, cookieOptions)
        .cookie("username", username, cookieOptions)
        .json({ message: "success" });
});

app.get(
    "/api/checkLogin",
    authorize,
    async function checkLogin(req: Request, res: Response) {
        //return the username
        let { token } = req.cookies;
        let username = tokenStorage[token].username;
        res.json({ username });
    }
);

app.post("/api/logout", async function logout(req: Request, res: Response) {
    let { token } = req.cookies;
    if (token === undefined) {
        return res.send();
    }
    if (!tokenStorage.hasOwnProperty(token)) {
        return res.send();
    }
    delete tokenStorage[token];
    res.clearCookie("token", cookieOptions)
        .clearCookie("username", cookieOptions)
        .send();
});

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
        let key: string;
        for (key in req.query) {
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
        return res.status(204);
    } else {
        return res.json(books);
    }
});

app.get("/api/books/:id", async (req, res: Response<BookRow | Error>) => {
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

//these types are atrocious, I know :( hopefully I can come back and figure out something better
async function verifyBookData(
    req:
        | Request<
              ParamsDictionary,
              | {
                    username: string;
                    id: string;
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
                }[]
              | { error: string },
              any,
              ParsedQs,
              Record<string, any>
          >
        | Request<
              ParamsDictionary,
              | { error: string }
              | {
                    username: string;
                    id: string;
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
                },
              any,
              ParsedQs,
              Record<string, any>
          >
) {
    if (!req.body.author_id) {
        return {
            status: 400,
            error: "Missing author_id",
        };
    }
    if (!req.body.title) {
        return {
            status: 400,
            error: "Missing title",
        };
    }
    if (!req.body.pub_year) {
        return {
            status: 400,
            error: "Missing pub_year",
        };
    }
    if (!req.body.genre) {
        return {
            status: 400,
            error: "Missing genre",
        };
    }

    //make sure genre is valid using Genre zod schema
    try {
        Genres.parse(req.body.genre);
    } catch (err) {
        return {
            status: 400,
            error: "Invalid genre",
        };
    }

    //make sure pub_year is a year (CE years only, BCE coming soon)
    if (isNaN(Number(req.body.pub_year))) {
        return {
            status: 400,
            error: "Invalid pub_year",
        };
    }

    //make sure book with same title and year and author and genre doesnt already exist
    let book: BookRow[] | undefined = await db.get(
        "SELECT * FROM books WHERE title = ? AND pub_year = ? AND author_id = ? AND genre = ?",
        [req.body.title, req.body.pub_year, req.body.author_id, req.body.genre]
    );

    if (book) {
        return {
            status: 400,
            error: "Book already exists",
        };
    }
    //make sure author exists
    let author: AuthorRow | undefined = await db.get(
        "SELECT * FROM authors WHERE id = ?",
        [req.body.author_id]
    );
    if (!author) {
        return {
            status: 400,
            error: "Author does not exist",
        };
    }
}

app.post("/api/books", authorize, async (req, res: BookResponse) => {
    let { token } = req.cookies;
    let username = tokenStorage[token].username;
    //make sure req body matches Book type
    if (!req.body) {
        return res.status(400).json({ error: "Missing request body" });
    }
    let error = await verifyBookData(req);
    if (error) {
        return res.status(error.status).json({ error: error.error });
    }
    //insert book
    let statement = await db.prepare(
        "INSERT INTO books(id, author_id, username, title, pub_year, genre) VALUES (?, ?, ?, ?, ?, ?)"
    );
    //get next id
    let id = await db.get("SELECT MAX(id) FROM books");
    id = id["MAX(id)"] + 1;
    await statement.bind([
        id,
        req.body.author_id,
        username,
        req.body.title,
        req.body.pub_year,
        req.body.genre,
    ]);
    await statement.run();
    //return book just created
    let book = await db.get("SELECT * FROM books WHERE id = ?", [id]);
    return res.status(201).json(book);
});
app.put("/api/books", authorize, async (req, res: Response<Error>) => {
    return res
        .status(405)
        .json({ error: "Method not allowed. Id must be specified" });
});

app.put(
    "/api/books/:id",
    authorize,
    async (req, res: Response<BookRow | Error>) => {
        //check if id is a number and points to a book
        if (isNaN(Number(req.params.id))) {
            return res.status(400).json({ error: "Invalid book id" });
        }
        let currentBook: BookRow | undefined = await db.get(
            "SELECT * FROM books WHERE id = ?",
            [req.params.id]
        );
        if (!currentBook) {
            return res.status(404).json({ error: "Book not found" });
        }
        //check if user is authorized to edit book
        let { token } = req.cookies;
        let username = tokenStorage[token].username;
        if (currentBook.username !== username) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        if (!req.body) {
            return res.status(400).json({ error: "Missing request body" });
        }
        //ts-ignore
        let error = await verifyBookData(req);
        if (error) {
            return res.status(error.status).json({ error: error.error });
        }

        //update book
        let statement = await db.prepare(
            "UPDATE books SET author_id = ?, title = ?, pub_year = ?, genre = ? WHERE id = ?"
        );
        await statement.bind([
            req.body.author_id,
            req.body.title,
            req.body.pub_year,
            req.body.genre,
            req.params.id,
        ]);
        await statement.run();
        //return updated book
        let newBook = await db.get("SELECT * FROM books WHERE id = ?", [
            req.params.id,
        ]);
        return res.status(200).json(newBook);
    }
);

app.delete("/api/books", authorize, async (req, res: BookResponse) => {
    return res
        .status(405)
        .json({ error: "Method not allowed. Id must be specified" });
});
app.delete("/api/books/:id", authorize, async (req, res: BookResponse) => {
    if (!req.params.id) {
        return res.status(400).json({ error: "Id is required" });
    }
    if (isNaN(Number(req.params.id))) {
        return res.status(400).json({ error: "Invalid id" });
    }

    let book: BookRow | undefined = await db.get(
        "SELECT * FROM books WHERE id = ?",
        [req.params.id]
    );
    if (!book) {
        return res.status(404).json({ error: "Book not found" });
    }
    if (book.username !== tokenStorage[req.cookies.token].username) {
        return res.status(403).json({ error: "Unauthorized" });
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
        return res.status(204);
    } else {
        return res.json(authors);
    }
});

app.get("/api/authors/:id", async (req, res: Response<AuthorRow | Error>) => {
    if (isNaN(Number(req.params.id))) {
        return res.status(400).json({ error: "Invalid author id" });
    }
    let author: AuthorRow | undefined = await db.get(
        "SELECT * FROM authors WHERE id = ?",
        [req.params.id]
    );
    if (!author) {
        return res.status(404).json({ error: "Author not found" });
    } else {
        return res.json(author);
    }
});

app.post("/api/authors", authorize, async (req, res: AuthorResponse) => {
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

app.delete("/api/authors", authorize, async (req, res: BookResponse) => {
    return res
        .status(405)
        .json({ error: "Method not allowed. Id must be specified" });
});

app.delete("/api/authors/:id", authorize, async (req, res: BookResponse) => {
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

app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// run server
let port = 3001;
let host = "localhost";
let protocol = "http";
app.listen(port, host, () => {
    console.log(`${protocol}://${host}:${port}`);
});
