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
                <Link to="/library">Library</Link>
            </b>
            <br />
            <br />
            <b>
                Add your own books and authors <Link to="/add">here</Link>
            </b>
        </div>
    );
}

export default Home;
