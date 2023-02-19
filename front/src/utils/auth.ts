export const checkAuth = async () => {
    let response = await fetch("http://localhost:3000/api/checkLogin", {
        method: "GET",
        credentials: "include",
    });
    if (response.status === 200) {
        let { username } = await response.json();
        return { success: true, username: username };
    } else {
        return { success: false };
    }
};
