DELETE FROM
    books;

DELETE FROM
    authors;

INSERT INTO
    authors(id, name, bio)
VALUES
    (
        1,
        'Ayn Rand',
        'A Russian-born American writer and philosopher'
    );

INSERT INTO
    authors(id, name, bio)
VALUES
    (
        2,
        'J.R.R. Tolkien',
        'An English writer, poet, philologist, and university professor'
    );

INSERT INTO
    authors(id, name, bio)
VALUES
    (
        3,
        'J.K. Rowling',
        'A British author, philanthropist, film producer, television producer, and screenwriter'
    );

INSERT INTO
    authors(id, name, bio)
VALUES
    (
        4,
        'Stephen King',
        'An American author of horror, supernatural fiction, suspense, science fiction, and fantasy'
    );

INSERT INTO
    books(id, author_id, title, pub_year, genre)
VALUES
    (1, 1, 'Anthem', '1938', 'dystopian');

INSERT INTO
    books(id, author_id, title, pub_year, genre)
VALUES
    (2, 2, 'The Hobbit', '1937', 'fantasy');

INSERT INTO
    books(id, author_id, title, pub_year, genre)
VALUES
    (
        3,
        3,
        'Harry Potter and the Sorcerer''s Stone',
        '1997',
        'fantasy'
    );

INSERT INTO
    books(id, author_id, title, pub_year, genre)
VALUES
    (
        4,
        3,
        'Harry Potter and the Chamber of Secrets',
        '1998',
        'fantasy'
    );

INSERT INTO
    books(id, author_id, title, pub_year, genre)
VALUES
    (5, 4, 'The Shining', '1977', 'horror');

INSERT INTO
    books(id, author_id, title, pub_year, genre)
VALUES
    (6, 4, 'It', '1986', 'horror');

INSERT INTO
    books(id, author_id, title, pub_year, genre)
VALUES
    (7, 4, 'The Green Mile', '1996', 'mystery');