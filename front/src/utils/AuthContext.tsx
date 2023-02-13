import React, { createContext, useState } from "react";
import { checkAuth } from "./auth";

interface AuthContextProps {
    isAuthenticated: boolean;
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AuthContext = createContext<AuthContextProps>({
    isAuthenticated: false,
    setIsAuthenticated: () => {},
});

interface AuthContextProviderProps {
    children: React.ReactNode;
}

export const AuthContextProvider: React.FC<AuthContextProviderProps> = ({
    children,
}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    React.useEffect(() => {
        checkAuth().then((result) => {
            setIsAuthenticated(result);
            console.log("isAuthenticated: ", result)
        });
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};
