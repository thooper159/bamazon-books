let genres = [
    "dystopian",
    "romance",
    "horror",
    "mystery",
    "fantasy",
    "sci-fi",
] as const;

export type Genres = typeof genres[number];

type Book = {
    author_id: string;
    username: string;
    title: string;
    pub_year: string;
    genre: Genres;
};

export type BookRes = { id: string } & Book;

export type Author = {
    name: string;
    bio: string;
};
export type AuthorRes = { id: string } & Author;
