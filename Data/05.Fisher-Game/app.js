document.addEventListener("DOMContentLoaded", () => {
    const baseUrl = "http://localhost:3030";
    const catchesUrl = `${baseUrl}/data/catches`;
    const loginUrl = `${baseUrl}/users/login`;
    const registerUrl = `${baseUrl}/users/register`;
    const logoutUrl = `${baseUrl}/users/logout`;

    const loadButton = document.getElementById("loadCatches");
    const addButton = document.getElementById("addButton");
    const catchesContainer = document.getElementById("catches");
    const addForm = document.getElementById("addForm");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const logoutButton = document.getElementById("logoutButton");

    loadButton.addEventListener("click", loadCatches);
    addForm.addEventListener("submit", addCatch);
    loginForm.addEventListener("submit", loginUser);
    registerForm.addEventListener("submit", registerUser);
    logoutButton.addEventListener("click", logoutUser);

    updateUI();

    function updateUI() {
        const userData = getUserData();
        if (userData) {
            addButton.disabled = false;
            logoutButton.style.display = "block";
        } else {
            addButton.disabled = true;
            logoutButton.style.display = "none";
        }
    }

    function getUserData() {
        return JSON.parse(localStorage.getItem("userData"));
    }

    function setUserData(data) {
        localStorage.setItem("userData", JSON.stringify(data));
        updateUI();
    }

    function clearUserData() {
        localStorage.removeItem("userData");
        updateUI();
    }

    async function loadCatches() {
        try {
            const response = await fetch(catchesUrl);
            if (!response.ok) throw new Error("Failed to load catches");

            const data = await response.json();
            catchesContainer.innerHTML = "";
            data.forEach(catchItem => {
                const catchElement = createCatchElement(catchItem);
                catchesContainer.appendChild(catchElement);
            });
        } catch (error) {
            console.error("Failed to load catches:", error);
        }
    }

    function createCatchElement(catchItem) {
        const userData = getUserData();
        const isOwner = userData && userData._id === catchItem._ownerId;

        const div = document.createElement("div");
        div.classList.add("catch");
        div.innerHTML = `
            <label>Angler</label>
            <input type="text" class="angler" value="${catchItem.angler}" ${!isOwner ? "disabled" : ""}>
            <label>Weight</label>
            <input type="number" class="weight" value="${catchItem.weight}" ${!isOwner ? "disabled" : ""}>
            <label>Species</label>
            <input type="text" class="species" value="${catchItem.species}" ${!isOwner ? "disabled" : ""}>
            <label>Location</label>
            <input type="text" class="location" value="${catchItem.location}" ${!isOwner ? "disabled" : ""}>
            <label>Bait</label>
            <input type="text" class="bait" value="${catchItem.bait}" ${!isOwner ? "disabled" : ""}>
            <label>Capture Time</label>
            <input type="number" class="captureTime" value="${catchItem.captureTime}" ${!isOwner ? "disabled" : ""}>
            <button class="update" data-id="${catchItem._id}" ${!isOwner ? "disabled" : ""}>Update</button>
            <button class="delete" data-id="${catchItem._id}" ${!isOwner ? "disabled" : ""}>Delete</button>
        `;

        if (isOwner) {
            div.querySelector(".update").addEventListener("click", () => updateCatch(catchItem._id, div));
            div.querySelector(".delete").addEventListener("click", () => deleteCatch(catchItem._id));
        }
        return div;
    }

    async function addCatch(event) {
        event.preventDefault();
        const formData = new FormData(addForm);
        const catchData = Object.fromEntries(formData.entries());

        try {
            const userData = getUserData();
            if (!userData) throw new Error("User not logged in");

            const response = await fetch(catchesUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Authorization": userData.token,
                },
                body: JSON.stringify({
                    angler: catchData.angler,
                    weight: Number(catchData.weight),
                    species: catchData.species,
                    location: catchData.location,
                    bait: catchData.bait,
                    captureTime: Number(catchData.captureTime),
                }),
            });

            if (!response.ok) throw new Error("Failed to add catch");
            addForm.reset();
            loadCatches();
        } catch (error) {
            console.error("Failed to add catch:", error);
        }
    }

    async function updateCatch(catchId, catchElement) {
        const userData = getUserData();
        if (!userData) return;

        const catchData = {
            angler: catchElement.querySelector(".angler").value,
            weight: parseFloat(catchElement.querySelector(".weight").value),
            species: catchElement.querySelector(".species").value,
            location: catchElement.querySelector(".location").value,
            bait: catchElement.querySelector(".bait").value,
            captureTime: parseInt(catchElement.querySelector(".captureTime").value, 10),
        };

        try {
            const response = await fetch(`${catchesUrl}/${catchId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-Authorization": userData.token,
                },
                body: JSON.stringify(catchData),
            });

            if (!response.ok) throw new Error("Failed to update catch");
            loadCatches();
        } catch (error) {
            console.error("Failed to update catch:", error);
        }
    }

    async function deleteCatch(catchId) {
        const userData = getUserData();
        if (!userData) return;

        try {
            const response = await fetch(`${catchesUrl}/${catchId}`, {
                method: "DELETE",
                headers: {
                    "X-Authorization": userData.token,
                },
            });

            if (!response.ok) throw new Error("Failed to delete catch");
            loadCatches();
        } catch (error) {
            console.error("Failed to delete catch:", error);
        }
    }

    async function loginUser(event) {
        event.preventDefault();
        const formData = new FormData(loginForm);
        const loginData = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(loginUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(loginData),
            });

            if (!response.ok) throw new Error("Invalid username or password");
            const userData = await response.json();
            setUserData(userData);
            loginForm.reset();
            loadCatches();
        } catch (error) {
            console.error("Failed to login:", error);
        }
    }

    async function registerUser(event) {
        event.preventDefault();
        const formData = new FormData(registerForm);
        const registerData = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(registerUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(registerData),
            });

            if (!response.ok) throw new Error("Invalid email or password");
            const userData = await response.json();
            setUserData(userData);
            registerForm.reset();
            loadCatches();
        } catch (error) {
            console.error("Failed to register:", error);
        }
    }

    async function logoutUser() {
        const userData = getUserData();
        if (!userData) return;

        try {
            const response = await fetch(logoutUrl, {
                method: "GET",
                headers: { "X-Authorization": userData.token },
            });

            if (!response.ok) throw new Error("Failed to logout");
            clearUserData();
            loadCatches();
        } catch (error) {
            console.error("Failed to logout:", error);
        }
    }
});