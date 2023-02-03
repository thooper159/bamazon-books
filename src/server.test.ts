import axios, { AxiosError } from "axios";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import url from "url";
import { stat } from "fs";

let port = 3000;
let host = "localhost";
let protocol = "http";
let baseUrl = `${protocol}://${host}:${port}`;

//absolute pathing snippet from Professor Long
let __dirname = url.fileURLToPath(new URL("..", import.meta.url));
let dbfile = `${__dirname}database.db`;
// console.log(dbfile);

let db = await open({
    filename: dbfile,
    driver: sqlite3.Database,
});
await db.get("PRAGMA foreign_keys = ON");

//The data from the books table
const someBooks = [
    {
        id: 1,
        author_id: 1,
        title: "Anthem",
        pub_year: "1938",
        genre: "dystopian",
    },
    {
        id: 2,
        author_id: 2,
        title: "The Hobbit",
        pub_year: "1937",
        genre: "fantasy",
    },
    {
        id: 3,
        author_id: 3,
        title: "Harry Potter and the Sorcerer's Stone",
        pub_year: "1997",
        genre: "fantasy",
    },
    {
        id: 4,
        author_id: 3,
        title: "Harry Potter and the Chamber of Secrets",
        pub_year: "1998",
        genre: "fantasy",
    },
    {
        id: 5,
        author_id: 4,
        title: "The Shining",
        pub_year: "1977",
        genre: "horror",
    },
    {
        id: 6,
        author_id: 4,
        title: "It",
        pub_year: "1986",
        genre: "horror",
    },
    {
        id: 7,
        author_id: 4,
        title: "The Green Mile",
        pub_year: "1996",
        genre: "mystery",
    },
];

//The data from the authors table
const someAuthors = [
    {
        id: 1,
        name: "Ayn Rand",
        bio: "A Russian-born American writer and philosopher",
    },
    {
        id: 2,
        name: "J.R.R. Tolkien",
        bio: "An English writer, poet, philologist, and university professor",
    },
    {
        id: 3,
        name: "J.K. Rowling",
        bio: "A British author, philanthropist, film producer, television producer, and screenwriter",
    },
    {
        id: 4,
        name: "Stephen King",
        bio: "An American author of horror, supernatural fiction, suspense, science fiction, and fantasy",
    },
];

//GET books

describe("GET /books", () => {
    beforeAll(async () => {
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
    });
    test("No argument returns all books", async () => {
        let { data } = await axios.get(`${baseUrl}/api/books`);
        expect(data).toEqual(someBooks);
    });

    test("Query by author_id returns all books by that author", async () => {
        let { data } = await axios.get(`${baseUrl}/api/books?author_id=3`);
        expect(data).toEqual([someBooks[2], someBooks[3]]);
    });

    test("Query by genre returns all books of that genre", async () => {
        let { data } = await axios.get(`${baseUrl}/api/books?genre=fantasy`);
        expect(data).toEqual([someBooks[1], someBooks[2], someBooks[3]]);
    });

    test("Query by title returns all books with that title", async () => {
        let { data } = await axios.get(
            `${baseUrl}/api/books?title=Harry Potter and the Sorcerer's Stone`
        );
        expect(data).toEqual([someBooks[2]]);
    });

    test("Query by pub_year returns all books published in that year", async () => {
        let { data } = await axios.get(`${baseUrl}/api/books?pub_year=1998`);
        expect(data).toEqual([someBooks[3]]);
    });

    test("Query with multiple args returns all books that match combo of args", async () => {
        let { data } = await axios.get(
            `${baseUrl}/api/books?author_id=4&genre=mystery`
        );
        expect(data).toEqual([someBooks[6]]);
    });

    test("Invalid query returns error", async () => {
        try {
            await axios.get(`${baseUrl}/api/books?foo=bar`);
        } catch (error) {
            let errorObj = error as AxiosError;
            if (errorObj.response === undefined) {
                throw errorObj;
            }
            let { response } = errorObj;
            expect(response.status).toEqual(400);
            expect(response.data).toEqual({
                error: "Invalid query param: foo",
            });
        }
    });

    test("Query with 1 parameter with no matches returns 204", async () => {
        try {
            await axios.get(`${baseUrl}/api/books?author_id=5`);
        } catch (error) {
            let errorObj = error as AxiosError;
            if (errorObj.response === undefined) {
                throw errorObj;
            }
            let { response } = errorObj;
            expect(response.status).toEqual(204);
        }
    });

    test("Query with multiple parameters with no matches returns empty array", async () => {
        try {
            await axios.get(`${baseUrl}/api/books?author_id=5&genre=mystery`);
        } catch (error) {
            let errorObj = error as AxiosError;
            if (errorObj.response === undefined) {
                throw errorObj;
            }
            let { response } = errorObj;
            expect(response.status).toEqual(204);
            expect(response.data).toEqual({
                error: "No books found",
            });
        }
    });
    test("Query with multiple parameters, one parameter is incorrect", async () => {
        try {
            await axios.get(`${baseUrl}/api/books?author_id=5&foo=bar`);
        } catch (error) {
            let errorObj = error as AxiosError;
            if (errorObj.response === undefined) {
                throw errorObj;
            }
            let { response } = errorObj;
            expect(response.status).toEqual(400);
            expect(response.data).toEqual({
                error: "Invalid query param: foo",
            });
        }
    });
});

describe("GET /books/:id", () => {
    beforeEach(async () => {
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
    });

    test("Valid id returns book", async () => {
        let { data } = await axios.get(`${baseUrl}/api/books/1`);
        expect(data).toEqual({
            id: 1,
            author_id: 1,
            title: "Anthem",
            pub_year: "1938",
            genre: "dystopian",
        });
    });

    test("Nonexistant id returns error", async () => {
        try {
            await axios.get(`${baseUrl}/api/books/8`);
        } catch (error) {
            let errorObj = error as AxiosError;
            if (errorObj.response === undefined) {
                throw errorObj;
            }
            let { response } = errorObj;
            expect(response.status).toEqual(404);
            expect(response.data).toEqual({
                error: "Book not found",
            });
        }
    });

    test("Invalid id type returns error", async () => {
        try {
            await axios.get(`${baseUrl}/api/books/foo`);
        } catch (error) {
            let errorObj = error as AxiosError;
            if (errorObj.response === undefined) {
                throw errorObj;
            }
            let { response } = errorObj;
            expect(response.status).toEqual(400);
            expect(response.data).toEqual({
                error: "Invalid book id",
            });
        }
    });
});

//POST books
describe("POST /books", () => {
    beforeEach(async () => {
        await db.exec("DELETE FROM books");
        await db.exec("DELETE FROM authors");
        await db.exec(
            "INSERT INTO authors(id, name, bio) VALUES (1, 'Ray Bradbury', 'American author')"
        );
        await db.exec(
            "INSERT INTO authors(id, name, bio) VALUES (2, 'J.R.R. Tolkien', 'English author')"
        );
        await db.exec(
            "INSERT INTO authors(id, name, bio) VALUES (3, 'J.K. Rowling', 'English author')"
        );
    });

    test("Valid data returns new book", async () => {
        let { data } = await axios.post(`${baseUrl}/api/books`, {
            author_id: 1,
            title: "Fahrenheit 451",
            pub_year: "1953",
            genre: "dystopian",
        });
        expect(data).toEqual({
            id: 1,
            author_id: 1,
            title: "Fahrenheit 451",
            pub_year: "1953",
            genre: "dystopian",
        });
    });

    test("Book already exists returns error", async () => {
        try {
            await axios.post(`${baseUrl}/api/books`, {
                author_id: 1,
                title: "Fahrenheit 451",
                pub_year: "1953",
                genre: "dystopian",
            });
            await axios.post(`${baseUrl}/api/books`, {
                author_id: 1,
                title: "Fahrenheit 451",
                pub_year: "1953",
                genre: "dystopian",
            });
        } catch (error) {
            let errorObj = error as AxiosError;
            if (errorObj.response === undefined) {
                throw errorObj;
            }
            let { response } = errorObj;
            expect(response.status).toEqual(400);
            expect(response.data).toEqual({
                error: "Book already exists",
            });
        }
    });

    test("Missing author_id returns error", async () => {
        try {
            await axios.post(`${baseUrl}/api/books`, {
                title: "Fahrenheit 451",
                pub_year: "1953",
                genre: "dystopian",
            });
        } catch (error) {
            let errorObj = error as AxiosError;
            if (errorObj.response === undefined) {
                throw errorObj;
            }
            let { response } = errorObj;
            expect(response.status).toEqual(400);
            expect(response.data).toEqual({
                error: "Missing author_id",
            });
        }
    });

    test("Invalid author_id returns error", async () => {
        try {
            await axios.post(`${baseUrl}/api/books`, {
                author_id: 5,
                title: "Fahrenheit 451",
                pub_year: "1953",
                genre: "dystopian",
            });
        } catch (error) {
            let errorObj = error as AxiosError;
            if (errorObj.response === undefined) {
                throw errorObj;
            }
            let { response } = errorObj;
            expect(response.status).toEqual(400);
            expect(response.data).toEqual({
                error: "Author does not exist",
            });
        }
    });

    test("Missing title returns error", async () => {
        try {
            await axios.post(`${baseUrl}/api/books`, {
                author_id: 1,
                pub_year: "1953",
                genre: "dystopian",
            });
        } catch (error) {
            let errorObj = error as AxiosError;
            if (errorObj.response === undefined) {
                throw errorObj;
            }
            let { response } = errorObj;
            expect(response.status).toEqual(400);
            expect(response.data).toEqual({
                error: "Missing title",
            });
        }
    });

    test("Missing pub_year returns error", async () => {
        try {
            await axios.post(`${baseUrl}/api/books`, {
                author_id: 1,
                title: "Fahrenheit 451",
                genre: "dystopian",
            });
        } catch (error) {
            let errorObj = error as AxiosError;
            if (errorObj.response === undefined) {
                throw errorObj;
            }
            let { response } = errorObj;
            expect(response.status).toEqual(400);
            expect(response.data).toEqual({
                error: "Missing pub_year",
            });
        }
    });

    test("Invalid pub_year returns error", async () => {
        try {
            await axios.post(`${baseUrl}/api/books`, {
                author_id: 1,
                title: "Fahrenheit 451",
                pub_year: "foo year",
                genre: "dystopian",
            });
        } catch (error) {
            let errorObj = error as AxiosError;
            if (errorObj.response === undefined) {
                throw errorObj;
            }
            let { response } = errorObj;
            expect(response.status).toEqual(400);
            expect(response.data).toEqual({
                error: "Invalid pub_year",
            });
        }
    });

    test("Missing genre returns error", async () => {
        try {
            await axios.post(`${baseUrl}/api/books`, {
                author_id: 1,
                title: "Fahrenheit 451",
                pub_year: "1953",
            });
        } catch (error) {
            let errorObj = error as AxiosError;
            if (errorObj.response === undefined) {
                throw errorObj;
            }
            let { response } = errorObj;
            expect(response.status).toEqual(400);
            expect(response.data).toEqual({
                error: "Missing genre",
            });
        }
    });

    test("Invalid genre returns error", async () => {
        try {
            await axios.post(`${baseUrl}/api/books`, {
                author_id: 1,
                title: "Fahrenheit 451",
                pub_year: "1953",
                genre: "fiction",
            });
        } catch (error) {
            let errorObj = error as AxiosError;
            if (errorObj.response === undefined) {
                throw errorObj;
            }
            let { response } = errorObj;
            expect(response.status).toEqual(400);
            expect(response.data).toEqual({
                error: "Invalid genre",
            });
        }
    });

    //ID is auto-incremented
    test("ID is auto-incremented", async () => {
        let { data: data1 } = await axios.post(`${baseUrl}/api/books`, {
            author_id: 1,
            title: "Fahrenheit 451",
            pub_year: "1953",
            genre: "dystopian",
        });
        let { data: data2 } = await axios.post(`${baseUrl}/api/books`, {
            author_id: 3,
            title: "Harry Potter and the Sorcerer's Stone",
            pub_year: "1997",
            genre: "fantasy",
        });
        expect(data1.id).toEqual(1);
        expect(data2.id).toEqual(2);
    });
});

//PUT books
describe("PUT /books/:id", () => {
    beforeEach(async () => {
        await db.exec("DELETE FROM books");
        await db.exec("DELETE FROM authors");
        await db.exec(
            "INSERT INTO authors(id, name, bio) VALUES (1, 'Ray Bradbury', 'American author')"
        );
        await db.exec(
            "INSERT INTO authors(id, name, bio) VALUES (2, 'J.R.R. Tolkien', 'English author')"
        );
        await db.exec(
            "INSERT INTO authors(id, name, bio) VALUES (3, 'J.K. Rowling', 'English author')"
        );
        await db.exec(
            "INSERT INTO books(id, author_id, title, pub_year, genre) VALUES (1, 1, 'Fahrenheit 451', '1953', 'dystopian')"
        );
        await db.exec(
            "INSERT INTO books(id, author_id, title, pub_year, genre) VALUES (2, 2, 'The Hobbit', '1937', 'fantasy')"
        );
        await db.exec(
            "INSERT INTO books(id, author_id, title, pub_year, genre) VALUES (3, 3, 'Harry Potter and the Sorcerer''s Stone', '1997', 'fantasy')"
        );
    });

    test("Update title", async () => {
        let { data } = await axios.put(`${baseUrl}/api/books/1`, {
            author_id: 1,
            title: "Fahrenheit 451: The temperature at which book paper catches fire and burns.",
            pub_year: "1953",
            genre: "dystopian",
        });
        expect(data).toEqual({
            id: 1,
            author_id: 1,
            title: "Fahrenheit 451: The temperature at which book paper catches fire and burns.",
            pub_year: "1953",
            genre: "dystopian",
        });
    });
});


//DELETE books
describe("DELETE /books/:id", () => {
    beforeEach(async () => {
        await db.exec("DELETE FROM books");
        await db.exec("DELETE FROM authors");
        await db.exec(
            "INSERT INTO authors(id, name, bio) VALUES (1, 'Ray Bradbury', 'American author')"
        );
        await db.exec(
            "INSERT INTO authors(id, name, bio) VALUES (2, 'J.R.R. Tolkien', 'English author')"
        );
        await db.exec(
            "INSERT INTO authors(id, name, bio) VALUES (3, 'J.K. Rowling', 'English author')"
        );
        await db.exec(
            "INSERT INTO books(id, author_id, title, pub_year, genre) VALUES (1, 1, 'Fahrenheit 451', '1953', 'dystopian')"
        );
        await db.exec(
            "INSERT INTO books(id, author_id, title, pub_year, genre) VALUES (2, 2, 'The Hobbit', '1937', 'fantasy')"
        );
    });

    //Delete book returns 200 status
    test("Delete book", async () => {
        try {
            await axios.delete(`${baseUrl}/api/books/1`);
        } catch (error) {
            let errorObj = error as AxiosError;
            if (errorObj.response === undefined) {
                throw errorObj;
            }
            let { response } = errorObj;
            expect(response.status).toEqual(200);
        }
    });

    //Missing id returns error
    test("Missing id returns error", async () => {
        try {
            await axios.delete(`${baseUrl}/api/books`);
        } catch (error) {
            let errorObj = error as AxiosError;
            if (errorObj.response === undefined) {
                throw errorObj;
            }
            let { response } = errorObj;
            expect(response.status).toEqual(405);
            expect(response.data).toEqual({
                error: "Method not allowed. Id must be specified",
            });
        }
    });
    //Invalid id returns error
    test("Invalid id returns error", async () => {
        try {
            await axios.delete(`${baseUrl}/api/books/abc`);
        } catch (error) {
            let errorObj = error as AxiosError;
            if (errorObj.response === undefined) {
                throw errorObj;
            }
            let { response } = errorObj;
            expect(response.status).toEqual(400);
            expect(response.data).toEqual({
                error: "Invalid id",
            });
        }
    });

    //Nonexistant id returns error
    test("Nonexistant id returns error", async () => {
        try {
            await axios.delete(`${baseUrl}/api/books/3`);
        } catch (error) {
            let errorObj = error as AxiosError;
            if (errorObj.response === undefined) {
                throw errorObj;
            }
            let { response } = errorObj;
            expect(response.status).toEqual(404);
            expect(response.data).toEqual({
                error: "Book not found",
            });
        }
    });

    //Cannot delete deleted book
    test("Cannot delete deleted book", async () => {
        try {
            await axios.delete(`${baseUrl}/api/books/1`);
            await axios.delete(`${baseUrl}/api/books/1`);
        } catch (error) {
            let errorObj = error as AxiosError;
            if (errorObj.response === undefined) {
                throw errorObj;
            }
            let { response } = errorObj;
            expect(response.status).toEqual(404);
            expect(response.data).toEqual({
                error: "Book not found",
            });
        }
    });
});

//GET authors
describe("GET /authors", () => {
    beforeAll(async () => {
        await db.exec("DELETE FROM books");
        await db.exec("DELETE FROM authors");
        await db.exec(
            "INSERT INTO authors(id, name, bio) VALUES (1, 'Ray Bradbury', 'American author')"
        );
        await db.exec(
            "INSERT INTO authors(id, name, bio) VALUES (2, 'J.R.R. Tolkien', 'English author')"
        );
        await db.exec(
            "INSERT INTO authors(id, name, bio) VALUES (3, 'J.K. Rowling', 'English author')"
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
    });

    //No arguments returns all authors
    test("No arguments returns all authors", async () => {
        let { data } = await axios.get(`${baseUrl}/api/authors`);
        expect(data).toEqual([
            {
                id: 1,
                name: "Ray Bradbury",
                bio: "American author",
            },
            {
                id: 2,
                name: "J.R.R. Tolkien",
                bio: "English author",
            },
            {
                id: 3,
                name: "J.K. Rowling",
                bio: "English author",
            },
        ]);
    });

    //Query by name returns author with matching name
    test("Query by name returns author with matching name", async () => {
        let { data } = await axios.get(`${baseUrl}/api/authors?name=J.K. Rowling`);
        expect(data).toEqual([
            {
                id: 3,
                name: "J.K. Rowling",
                bio: "English author",
            },
        ]);
    });

    //Query by name that doesnt exist returns empty array
    test("Query by name that doesnt exist returns empty array", async () => {
        let { data } = await axios.get(`${baseUrl}/api/authors?name=Stephen King`);
        expect(data).toEqual([]);
    });

    //Invalid query returns error
    test("Invalid query returns error", async () => {
        try {
            await axios.get(`${baseUrl}/api/authors?foo=bar`);
        } catch (error) {
            let errorObj = error as AxiosError;
            if (errorObj.response === undefined) {
                throw errorObj;
            }
            let { response } = errorObj;
            expect(response.status).toEqual(400);
            expect(response.data).toEqual({
                error: "Invalid query param",
            });
        }
    });

    //Invalid query value returns error
    test("More than one query returns error", async () => {
        try {
            await axios.get(`${baseUrl}/api/authors?name=J.K. Rowling&age=30`);
        } catch (error) {
            let errorObj = error as AxiosError;
            if (errorObj.response === undefined) {
                throw errorObj;
            }
            let { response } = errorObj;
            expect(response.status).toEqual(400);
            expect(response.data).toEqual({
                error: "Too many query params",
            });
        }
    });

    //
});

//GET authors/:id
describe("GET /authors/:id", () => {
    beforeAll(async () => {
        await db.exec("DELETE FROM books");
        await db.exec("DELETE FROM authors");
        await db.exec(
            "INSERT INTO authors(id, name, bio) VALUES (1, 'Ray Bradbury', 'American author')"
        );
        await db.exec(
            "INSERT INTO authors(id, name, bio) VALUES (2, 'J.R.R. Tolkien', 'English author')"
        );
        await db.exec(
            "INSERT INTO authors(id, name, bio) VALUES (3, 'J.K. Rowling', 'English author')"
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
    });
    //Valid id returns author
    test("Valid id returns author", async () => {
        let { data } = await axios.get(`${baseUrl}/api/authors/1`);
        expect(data).toEqual({
            id: 1,
            name: "Ray Bradbury",
            bio: "American author",
        });
    });

    //Nonexistant id returns error
    test("Nonexistant id returns error", async () => {
        try {
            await axios.get(`${baseUrl}/api/authors/4`);
        } catch (error) {
            let errorObj = error as AxiosError;
            if (errorObj.response === undefined) {
                throw errorObj;
            }
            let { response } = errorObj;
            expect(response.status).toEqual(404);
            expect(response.data).toEqual({
                error: "Author not found",
            });
        }
    });

    //Invalid id type
    test("Invalid id type returns error", async () => {
        try {
            await axios.get(`${baseUrl}/api/authors/foo`);
        } catch (error) {
            let errorObj = error as AxiosError;
            if (errorObj.response === undefined) {
                throw errorObj;
            }
            let { response } = errorObj;
            expect(response.status).toEqual(400);
            expect(response.data).toEqual({
                error: "Invalid author id",
            });
        }
    });
});

//POST authors
describe("POST /authors", () => {
    beforeEach(async () => {
        await db.exec("DELETE FROM books");
        await db.exec("DELETE FROM authors");
    });

    //Valid data returns new author
    test("Valid data returns new author", async () => {
        let { data } = await axios.post(`${baseUrl}/api/authors`, {
            name: "Stephen King",
            bio: "American author",
        });
        expect(data).toEqual({
            id: 1,
            name: "Stephen King",
            bio: "American author",
        });
    });

    //Author already exists returns error
    test("Author already exists returns error", async () => {
        try {
            await axios.post(`${baseUrl}/api/authors`, {
                name: "Stephen King",
                bio: "American author",
            });
            await axios.post(`${baseUrl}/api/authors`, {
                name: "Stephen King",
                bio: "American author",
            });
        } catch (error) {
            let errorObj = error as AxiosError;
            if (errorObj.response === undefined) {
                throw errorObj;
            }
            let { response } = errorObj;
            expect(response.status).toEqual(400);
            expect(response.data).toEqual({
                error: "Author already exists",
            });
        }
    });

    //Missing name returns error
    test("Missing name returns error", async () => {
        try {
            await axios.post(`${baseUrl}/api/authors`, {
                bio: "American author",
            });
        } catch (error) {
            let errorObj = error as AxiosError;
            if (errorObj.response === undefined) {
                throw errorObj;
            }
            let { response } = errorObj;
            expect(response.status).toEqual(400);
            expect(response.data).toEqual({
                error: "Missing name",
            });
        }
    });

    //Missing bio returns error\
    test("Missing bio returns error", async () => {
        try {
            await axios.post(`${baseUrl}/api/authors`, {
                name: "Stephen King",
            });
        } catch (error) {
            let errorObj = error as AxiosError;
            if (errorObj.response === undefined) {
                throw errorObj;
            }
            let { response } = errorObj;
            expect(response.status).toEqual(400);
            expect(response.data).toEqual({
                error: "Missing bio",
            });
        }
    });

    //ID is autoincremented
    test("ID is autoincremented", async () => {
        let { data } = await axios.post(`${baseUrl}/api/authors`, {
            name: "Stephen King",
            bio: "American author",
        });
        expect(data).toEqual({
            id: 1,
            name: "Stephen King",
            bio: "American author",
        });
        let { data: data2 } = await axios.post(`${baseUrl}/api/authors`, {
            name: "J.K. Rowling",
            bio: "English author",
        });
        expect(data2).toEqual({
            id: 2,
            name: "J.K. Rowling",
            bio: "English author",
        });
    });
});

//DELETE authors

//JK Rowling has no books
//Tolkien has 1 book
//Bradbury has 1 book
describe("DELETE /authors/:id", () => {
    beforeEach(async () => {
        await db.exec("DELETE FROM books");
        await db.exec("DELETE FROM authors");
        await db.exec(
            "INSERT INTO authors(id, name, bio) VALUES (1, 'Ray Bradbury', 'American author')"
        );
        await db.exec(
            "INSERT INTO authors(id, name, bio) VALUES (2, 'J.R.R. Tolkien', 'English author')"
        );
        await db.exec(
            "INSERT INTO authors(id, name, bio) VALUES (3, 'J.K. Rowling', 'English author')"
        );
        await db.exec(
            "INSERT INTO books(id, author_id, title, pub_year, genre) VALUES (1, 1, 'Anthem', '1938','dystopian')"
        );
        await db.exec(
            "INSERT INTO books(id, author_id, title, pub_year, genre) VALUES (2, 2, 'The Hobbit', '1937','fantasy')"
        );
    });

    //Delete author with no books
    test("Delete author with no books", async () => {
        let { status } = await axios.delete(`${baseUrl}/api/authors/3`);
        expect(status).toEqual(200);
    });

    //Delete author with books returns error
    test("Delete author with books returns error", async () => {
        try {
            await axios.delete(`${baseUrl}/api/authors/1`);
        } catch (error) {
            let errorObj = error as AxiosError;
            if (errorObj.response === undefined) {
                throw errorObj;
            }
            let { response } = errorObj;
            expect(response.status).toEqual(400);
            expect(response.data).toEqual({
                error: "Author has books",
            });
        }
    });

    //Missing id returns error
    test("Missing id returns error", async () => {
        try {
            await axios.delete(`${baseUrl}/api/authors/`);
        } catch (error) {
            let errorObj = error as AxiosError;
            if (errorObj.response === undefined) {
                throw errorObj;
            }
            let { response } = errorObj;
            expect(response.status).toEqual(405);
            expect(response.data).toEqual({
                error: "Method not allowed. Id must be specified",
            });
        }
    });

    //Invalid id returns error
    test("Invalid id returns error", async () => {
        try {
            await axios.delete(`${baseUrl}/api/authors/abc`);
        } catch (error) {
            let errorObj = error as AxiosError;
            if (errorObj.response === undefined) {
                throw errorObj;
            }
            let { response } = errorObj;
            expect(response.status).toEqual(400);
            expect(response.data).toEqual({
                error: "Invalid id",
            });
        }
    });

    //Nonexistent id returns error
    test("Nonexistent id returns error", async () => {
        try {
            await axios.delete(`${baseUrl}/api/authors/4`);
        } catch (error) {
            let errorObj = error as AxiosError;
            if (errorObj.response === undefined) {
                throw errorObj;
            }
            let { response } = errorObj;
            expect(response.status).toEqual(404);
            expect(response.data).toEqual({
                error: "Author not found",
            });
        }
    });

    //Cannot delete deleted author
    test("Cannot delete deleted author", async () => {
        await axios.delete(`${baseUrl}/api/authors/3`);
        try {
            await axios.delete(`${baseUrl}/api/authors/3`);
        } catch (error) {
            let errorObj = error as AxiosError;
            if (errorObj.response === undefined) {
                throw errorObj;
            }
            let { response } = errorObj;
            expect(response.status).toEqual(404);
            expect(response.data).toEqual({
                error: "Author not found",
            });
        }
    });
});
