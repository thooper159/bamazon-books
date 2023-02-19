DELETE FROM
    books;

DELETE FROM
    authors;

DELETE FROM
    users;

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
    books(id, author_id, username, title, pub_year, genre)
VALUES
    (1, 1, "admin", 'Anthem', '1938', 'dystopian');

INSERT INTO
    books(id, author_id, username, title, pub_year, genre)
VALUES
    (2, 2, "admin", 'The Hobbit', '1937', 'fantasy');

INSERT INTO
    books(id, author_id, username, title, pub_year, genre)
VALUES
    (
        3,
        3,
        "admin",
        'Harry Potter and the Sorcerer''s Stone',
        '1997',
        'fantasy'
    );

INSERT INTO
    books(id, author_id, username, title, pub_year, genre)
VALUES
    (
        4,
        3,
        "admin",
        'Harry Potter and the Chamber of Secrets',
        '1998',
        'fantasy'
    );

INSERT INTO
    books(id, author_id, username, title, pub_year, genre)
VALUES
    (
        5,
        4,
        "applesauce",
        'The Shining',
        '1977',
        'horror'
    );

INSERT INTO
    books(id, author_id, username, title, pub_year, genre)
VALUES
    (6, 4, "applesauce", 'It', '1986', 'horror');

INSERT INTO
    books(id, author_id, username, title, pub_year, genre)
VALUES
    (
        7,
        4,
        "applesauce",
        'The Green Mile',
        '1996',
        'mystery'
    );

-- password
INSERT INTO
    users(username, password)
VALUES
    (
        'admin',
        '$argon2id$v=19$m=65536,t=3,p=4$0toyJJQ6Xdv5rUQq1cCoCQ$hYs/2qQrQDy4gld9v4fy0kiQnBzpAu/FWyJgyTq3Ito'
    );

-- abc
INSERT INTO
    users(username, password)
VALUES
    (
        'applesauce',
        '$argon2id$v=19$m=65536,t=3,p=4$aet/Up/t2f9Bu8teKj5SZA$KTYJ35q136nHVyphnqR3Zs9an5gS0hn1inw5YUoi8TU'
    );