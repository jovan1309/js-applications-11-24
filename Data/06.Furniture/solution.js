document.addEventListener("DOMContentLoaded", () => {
  const baseUrl = "http://localhost:3030";
  const furnitureUrl = `${baseUrl}/data/furniture`;
  const registerUrl = `${baseUrl}/users/register`;
  const loginUrl = `${baseUrl}/users/login`;
  const ordersUrl = `${baseUrl}/data/orders`;

  const furnitureContainer = document.getElementById("furniture");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const createForm = document.getElementById("createForm");
  const buyButton = document.getElementById("buyButton");
  const ordersButton = document.getElementById("ordersButton");
  const logoutButton = document.getElementById("logoutButton");

  const userData = getUserData();
  updateUI();

  loadFurniture();

  function updateUI() {
      if (userData) {
          createForm.style.display = "block";
          buyButton.style.display = "block";
          logoutButton.style.display = "block";
      } else {
          createForm.style.display = "none";
          buyButton.style.display = "none";
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

  async function loadFurniture() {
      try {
          const response = await fetch(furnitureUrl);
          const data = await response.json();
          furnitureContainer.innerHTML = "";

          data.forEach(item => {
              const row = createFurnitureRow(item);
              furnitureContainer.appendChild(row);
          });
      } catch (error) {
          console.error("Failed to load furniture:", error);
      }
  }

  function createFurnitureRow(item) {
      const row = document.createElement("tr");
      row.innerHTML = `
          <td><img src="${item.img}" alt="${item.name}" /></td>
          <td>${item.name}</td>
          <td>${item.price}</td>
          <td>${item.factor}</td>
          <td>
              <input type="checkbox" class="buy-checkbox" data-id="${item._id}" ${!userData ? "disabled" : ""}>
          </td>
      `;
      return row;
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

          if (!response.ok) throw new Error("Registration failed");
          const userData = await response.json();
          setUserData(userData);
          loadFurniture();
      } catch (error) {
          console.error("Failed to register:", error);
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

          if (!response.ok) throw new Error("Login failed");
          const userData = await response.json();
          setUserData(userData);
          loadFurniture();
      } catch (error) {
          console.error("Failed to login:", error);
      }
  }

  async function createFurniture(event) {
      event.preventDefault();
      const formData = new FormData(createForm);
      const furnitureData = Object.fromEntries(formData.entries());

      try {
          const response = await fetch(furnitureUrl, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  "X-Authorization": userData.token,
              },
              body: JSON.stringify(furnitureData),
          });

          if (!response.ok) throw new Error("Failed to create furniture");
          loadFurniture();
      } catch (error) {
          console.error("Failed to create furniture:", error);
      }
  }

  async function buyFurniture() {
      const checkboxes = document.querySelectorAll(".buy-checkbox:checked");
      const orders = [];

      checkboxes.forEach(checkbox => {
          orders.push({ furnitureId: checkbox.dataset.id });
      });

      if (orders.length === 0) {
          alert("Please select at least one furniture item to buy.");
          return;
      }

      try {
          const response = await fetch(ordersUrl, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  "X-Authorization": userData.token,
              },
              body: JSON.stringify(orders),
          });

          if (!response.ok) throw new Error("Failed to buy furniture");
          alert("Furniture purchased successfully!");
      } catch (error) {
          console.error("Failed to buy furniture:", error);
      }
  }

  async function loadUserOrders() {
      try {
          const response = await fetch(`${ordersUrl}?where=_ownerId%3D${userData._id}`, {
              headers: {
                  "X-Authorization": userData.token,
              },
          });

          if (!response.ok) throw new Error("Failed to load orders");
          const orders = await response.json();
          displayOrders(orders);
      } catch (error) {
          console.error("Failed to load user orders:", error);
      }
  }

  function displayOrders(orders) {
      const ordersList = document.getElementById("ordersList");
      ordersList.innerHTML = "";

      let totalPrice = 0;
      orders.forEach(order => {
          const li = document.createElement("li");
          li.textContent = order.furnitureName;
          totalPrice += order.price;
          ordersList.appendChild(li);
      });

      const total = document.getElementById("totalPrice");
      total.textContent = `Total Price: ${totalPrice.toFixed(2)}`;
  }

  loginForm.addEventListener("submit", loginUser);
  registerForm.addEventListener("submit", registerUser);
  createForm.addEventListener("submit", createFurniture);
  buyButton.addEventListener("click", buyFurniture);
  ordersButton.addEventListener("click", loadUserOrders);
  logoutButton.addEventListener("click", () => {
      localStorage.removeItem("userData");
      updateUI();
      loadFurniture();
  });
});