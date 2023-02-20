export const checkAuth = async () => {
    const endpoint = process.env.REACT_APP_API_ENDPOINT;
    let response = await fetch(endpoint + "/api/checkLogin", {
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
