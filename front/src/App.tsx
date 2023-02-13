import React from "react";
import Navbar from "./components/navbar";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link,
    Navigate,
} from "react-router-dom";
import Home from "./pages/";
import Library from "./pages/library";
import Add from "./pages/add";
import Search from "./pages/search";
import Edit from "./pages/edit";
import { AuthContext } from "./utils/AuthContext";

function App() {
    const { isAuthenticated } = React.useContext(AuthContext);

    const ReturnHome = () => {
        return <Navigate to="/" />;
    };

    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/library" element={<Library />} />
                {isAuthenticated ? (
                    <>
                        <Route path="/add" element={<Add />} />
                        <Route path="/edit" element={<Edit />} />
                    </>
                ) : (
                    <>
                        <Route path="/add" element={<ReturnHome />} />
                        <Route path="/edit" element={<ReturnHome />} />
                    </>
                )}
                <Route path="/search" element={<Search />} />
                <Route
                    path="*"
                    element={
                        <>
                            <h1>404: Not Found</h1> <br /> <br />{" "}
                            <Link to="/">Back to Safety</Link>
                        </>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
