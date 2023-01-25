import React from "react";
import { Nav, NavLink, NavMenu } from "./NavbarElements";
//CSS and structure based on:
//www.geeksforgeeks.org/how-to-create-a-multi-page-website-using-react-js/
function Navbar() {
    return (
        <>
            <Nav>
                <NavMenu>
                    <NavLink to="/">Home</NavLink>
                    <NavLink to="/library">Library</NavLink>
                    <NavLink to="/add">Add</NavLink>
                    <NavLink to="/search">Search</NavLink>
                </NavMenu>
            </Nav>
        </>
    );
}
export default Navbar;
