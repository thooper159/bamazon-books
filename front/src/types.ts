export type Book = {
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
export type BookRes = { id: string } & Book;

export type Author = {
    name: string;
    bio: string;
};
export type AuthorRes = { id: string } & Author;
