import React, { createContext, useState } from "react";
import { checkAuth } from "./auth";

interface AuthContextProps {
    isAuthenticated: boolean;
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
    username: string;
    setUsername: React.Dispatch<React.SetStateAction<string>>;
}

export const AuthContext = createContext<AuthContextProps>({
    isAuthenticated: false,
    setIsAuthenticated: () => {},
    username: "",
    setUsername: () => {},
});

interface AuthContextProviderProps {
    children: React.ReactNode;
}

export const AuthContextProvider: React.FC<AuthContextProviderProps> = ({
    children,
}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState("");

    React.useEffect(() => {
        checkAuth().then((result) => {
            setIsAuthenticated(result.success);
            setUsername(result.username);
        });
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, username, setUsername }}>
            {children}
        </AuthContext.Provider>
    );
};
