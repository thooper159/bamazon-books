CREATE TABLE books (
    id INTEGER PRIMARY KEY, -- can change to be integer if you want
    author_id TEXT,
    title TEXT,
    pub_year TEXT,
    genre TEXT,
    FOREIGN KEY(author_id) REFERENCES authors(id)
);

CREATE TABLE authors (
    id INTEGER PRIMARY KEY, -- can change to be integer if you want ok :)
    name TEXT,
    bio TEXT
);
