import React from "react";
import Navbar from "./components/navbar";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/";
import Library from "./pages/library";
import Add from "./pages/add";
import Search from "./pages/search";
import Edit from "./pages/edit";
import Login from "./pages/login";

function App() {

    const requireAuth = () => {
        //TODO: Implement authentication
    };
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />}/>
                <Route path="/library" element={<Library />} />
                <Route path="/add" element={<Add />} />
                <Route path="/edit" element={<Edit />} />
                <Route path="/search" element={<Search />} />
                <Route
                    path="*"
                    element={
                        <>
                            <h1>404: Not Found</h1> <br /> <br /> <Link to="/">Back to Safety</Link>
                        </>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
