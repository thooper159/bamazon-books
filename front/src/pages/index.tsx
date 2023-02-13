import React from "react";
import { Link } from "react-router-dom";

function Home() {
    return (
        <div>
            <h1>Bamazon Books</h1>
            <b>Welcome to Bamazon Books, home to tens of books and authors!</b>
            <br />
            <br />
            <b>
                Check out our collection in the{" "}
                <Link to="/library">Library</Link> page or search for a specific
                book in the <Link to="/search">Search</Link> page.
            </b>
            <br />
            <br />
            <b>
                Please log in to add or edit books in the{" "}
                <Link to="/add">Add</Link> and <Link to="/edit">Edit</Link>{" "}
                pages.
            </b>
        </div>
    );
}

export default Home;
