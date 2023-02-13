export const checkAuth = async () => {
    let response = await fetch("http://localhost:3000/api/checkLogin", {
        method: "GET",
        credentials: "include",
    });
    if (response.status === 200) {
        return true;
    } else {
        return false;
    }
};
