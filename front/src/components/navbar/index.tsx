import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    TextField,
    Typography,
} from "@mui/material";
import React from "react";
import { Nav, NavLink, NavMenu } from "./NavbarElements";
import Cookies from "js-cookie";
import { checkAuth } from "../../utils/auth";
import { AuthContext } from "../../utils/AuthContext";
import { redirect } from "react-router-dom";
//CSS and structure based on:
//www.geeksforgeeks.org/how-to-create-a-multi-page-website-using-react-js/

function Navbar() {
    const [loginModalOpen, setLoginModalOpen] = React.useState(false);
    const [loginMessage, setLoginMessage] = React.useState("");

    const { isAuthenticated, setIsAuthenticated } =
        React.useContext(AuthContext);

    React.useEffect(() => {
        const sendRequest = async () => {
            const isAuth = await checkAuth();
            if (isAuth) {
                setIsAuthenticated(true);
            }
        };
        sendRequest().catch(console.error);
    }, [setIsAuthenticated]);

    const handleLoginModalOpen = () => {
        setLoginModalOpen(true);
    };
    const handleLoginModalClose = () => {
        setLoginModalOpen(false);
    };

    const LoginModal = () => {
        const [loginUsername, setLoginUsername] = React.useState("");
        const [loginPassword, setLoginPassword] = React.useState("");
        const [signupUsername, setSignupUsername] = React.useState("");
        const [signupPassword, setSignupPassword] = React.useState("");
        const [signupPasswordConfirm, setSignupPasswordConfirm] =
            React.useState("");

        const login = async () => {
            if (loginUsername === "" || loginPassword === "") {
                alert("Please fill in all fields");
                return;
            }
            let response = await fetch("http://localhost:3000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: loginUsername,
                    password: loginPassword,
                }),
                credentials: "include",
            });
            if (response.status === 200) {
                handleLoginModalClose();
                setIsAuthenticated(true);
            } else {
                setLoginMessage(response.statusText);
            }
        };

        function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
            const target = event.target;
            const value = target.value;
            const name = target.name;

            if (name === "loginUsername") {
                setLoginUsername(value);
            } else if (name === "loginPassword") {
                setLoginPassword(value);
            } else if (name === "signupUsername") {
                setSignupUsername(value);
            } else if (name === "signupPassword") {
                setSignupPassword(value);
            } else if (name === "signupPasswordConfirm") {
                setSignupPasswordConfirm(value);
            }
        }

        return (
            <Dialog
                open={loginModalOpen}
                onClose={handleLoginModalClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                fullWidth={true}
                maxWidth={"lg"}
            >
                <DialogTitle id="alert-dialog-title">
                    Login / Sign-up
                </DialogTitle>
                <DialogContent>
                    {/* make two columns, one for login one for signup */}
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="h6" gutterBottom>
                                Login
                            </Typography>
                            <FormControl fullWidth sx={{ mt: 3 }}>
                                <TextField
                                    required
                                    id="loginUsername"
                                    name="loginUsername"
                                    label="Username"
                                    value={loginUsername}
                                    fullWidth
                                    autoComplete="username"
                                    onChange={handleInputChange}
                                />
                            </FormControl>
                            <FormControl fullWidth sx={{ mt: 3 }}>
                                <TextField
                                    required
                                    id="loginPassword"
                                    name="loginPassword"
                                    label="Password"
                                    value={loginPassword}
                                    fullWidth
                                    autoComplete="password"
                                    onChange={handleInputChange}
                                    type="password"
                                />
                            </FormControl>
                            <Typography variant="body2" gutterBottom>
                                {loginMessage}
                            </Typography>
                            <Button
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                onClick={() => {
                                    login();
                                }}
                            >
                                Login
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="h6" gutterBottom>
                                Sign-up
                            </Typography>
                            <FormControl fullWidth sx={{ mt: 3 }}>
                                <TextField
                                    required
                                    id="signupUsername"
                                    name="signupUsername"
                                    label="Username"
                                    value={signupUsername}
                                    fullWidth
                                    onChange={handleInputChange}
                                />
                            </FormControl>
                            <FormControl fullWidth sx={{ mt: 3 }}>
                                <TextField
                                    required
                                    id="signupPassword"
                                    name="signupPassword"
                                    label="Password"
                                    value={signupPassword}
                                    fullWidth
                                    onChange={handleInputChange}
                                    type="password"
                                />
                            </FormControl>
                            <FormControl fullWidth sx={{ mt: 3 }}>
                                <TextField
                                    required
                                    id="signupPasswordConfirm"
                                    name="signupPasswordConfirm"
                                    label="Confirm Password"
                                    value={signupPasswordConfirm}
                                    fullWidth
                                    onChange={handleInputChange}
                                    type="password"
                                />
                            </FormControl>
                            <Button variant="contained" sx={{ mt: 3, mb: 2 }}>
                                Sign-up
                            </Button>
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog>
        );
    };

    const logout = async () => {
        let response = await fetch("http://localhost:3000/api/logout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });
        if (response.status === 200) {
            setIsAuthenticated(false);
            redirect("/");
        }
    };

    return (
        <>
            <Nav>
                <NavMenu>
                    <NavLink to="/">Home</NavLink>
                    <NavLink to="/library">Library</NavLink>
                    {isAuthenticated && (
                        <>
                            <NavLink to="/add">Add</NavLink>
                            <NavLink to="/edit">Edit</NavLink>
                        </>
                    )}

                    <NavLink to="/search">Search</NavLink>
                    {isAuthenticated ? (
                        <>
                            <Button
                                variant="contained"
                                color="error"
                                onClick={() => {
                                    logout();
                                }}
                            >
                                Logout
                            </Button>
                            <Typography
                                variant="body2"
                                color={"white"}
                                gutterBottom
                            >
                                {Cookies.get("username")}
                            </Typography>
                        </>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={() => {
                                handleLoginModalOpen();
                            }}
                        >
                            Login
                        </Button>
                    )}
                </NavMenu>
            </Nav>
            <LoginModal />
        </>
    );
}
export default Navbar;
