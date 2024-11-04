document.addEventListener("DOMContentLoaded", () => {
    const loadBookButton = document.getElementById("loadBooks");
    const bookForm = document.querySelector("form");
    const bookList = document.querySelector("tbody");

    const url = "http://localhost:3030/jsonstore/collections/books";

    loadBookButton.addEventListener("click", loadBooks);

    bookForm.addEventListener("submit", handleFormSubmit);

    async function loadBooks() {
        try {
            const response = await fetch(url);
            const data = await response.json();

            bookList.innerHTML = "";

            Object.entries(data).forEach(([id, book]) => {
                const row = document.createElement("tr");

                const titleCell = document.createElement("td");
                titleCell.textContent = book.title;
                row.appendChild(titleCell);

                const authorCell = document.createElement("td");
                authorCell.textContent = book.author;
                row.appendChild(authorCell);

                const actionCell = document.createElement("td");

                const editButton = document.createElement("button");
                editButton.textContent = "Edit";
                editButton.setAttribute("data-id", id);
                editButton.addEventListener("click", () => handleEdit(id, book));
                actionCell.appendChild(editButton);

                const deleteButton = document.createElement("button");
                deleteButton.textContent = "Delete";
                deleteButton.setAttribute("data-id", id);
                deleteButton.addEventListener("click", () => handleDelete(id));
                actionCell.appendChild(deleteButton);

                row.appendChild(actionCell);
                bookList.appendChild(row);
            });
        } catch (error) {
            console.error("Failed to load books:", error);
        }
    }

    async function handleFormSubmit(event) {
        event.preventDefault();

        const formData = new FormData(bookForm);
        const title = formData.get("title");
        const author = formData.get("author");
        const bookId = bookForm.getAttribute("data-id");

        const book = { title, author };

        try {
            let response;
            if (bookId) {
                response = await fetch(`${url}/${bookId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(book),
                });
            } else {
                response = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(book),
                });
            }

            if (!response.ok) throw new Error("Failed to save book");

            bookForm.reset();
            bookForm.removeAttribute("data-id");
            loadBooks();
        } catch (error) {
            console.error("Failed to submit form:", error);
        }
    }

    async function handleEdit(id, book) {
        bookForm.querySelector("[name='title']").value = book.title;
        bookForm.querySelector("[name='author']").value = book.author;
        bookForm.setAttribute("data-id", id);
    }

    async function handleDelete(id) {
        try {
            const response = await fetch(`${url}/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete book");

            loadBooks();
        } catch (error) {
            console.error("Failed to delete book:", error);
        }
    }
});