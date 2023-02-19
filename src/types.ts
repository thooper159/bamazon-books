import { Response } from "express";
import { z } from "zod";

const Genres = z.enum([
    "dystopian",
    "romance",
    "horror",
    "mystery",
    "fantasy",
    "sci-fi",
]);

type Genres = z.infer<typeof Genres>;

const Book = z.object({
    author_id: z.string().regex(/^\d+$/, { message: "Invalid book id" }),
    username: z.string().min(1, { message: "Missing username" }),
    title: z
        .string()
        .min(1, { message: "Missing title" })
        .max(200, { message: "Title too long" }),
    pub_year: z
        .string()
        .min(1, { message: "Missing pub_year" })
        .max(4, { message: "Must be valid CE year" })
        .regex(/^\d+$/, { message: "Must be valid CE year" }),
    genre: Genres,
});

type Book = z.infer<typeof Book>;

const ID = z
    .string()
    .min(1, { message: "Missing id" })
    .regex(/^\d+$/, { message: "Invalid id" });

type ID = z.infer<typeof ID>;

const BookRow = z
    .object({
        id: ID,
    })
    .merge(Book);

type BookRow = z.infer<typeof BookRow>;

const Author = z.object({
    name: z
        .string()
        .min(1, { message: "Missing name" })
        .max(100, { message: "Name too long" }),
    bio: z
        .string()
        .min(1, { message: "Missing bio" })
        .max(1000, { message: "Bio too long" }),
});

type Author = z.infer<typeof Author>;

const AuthorRow = z
    .object({
        id: ID,
    })
    .merge(Author);

type AuthorRow = z.infer<typeof AuthorRow>;

const Error = z.object({
    error: z.string(),
});

type Error = z.infer<typeof Error>;

type BookResponse = Response<BookRow[] | Error>;

type AuthorResponse = Response<AuthorRow[] | Error>;

export {
    Book,
    BookRow,
    Author,
    AuthorRow,
    BookResponse,
    AuthorResponse,
    ID,
    Genres,
    Error,
};
