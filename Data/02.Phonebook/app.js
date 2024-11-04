function attachEvents() {
    const url = "http://localhost:3030/jsonstore/phonebook";

    const ul = document.getElementById("phonebook");
    const loadButton = document.getElementById("btnLoad");
    const createButton = document.getElementById("btnCreate");
    const person = document.getElementById("person");
    const phone = document.getElementById("phone");

    loadButton.addEventListener("click", onClickLoad);
    createButton.addEventListener("click", onClickCreate);

    async function onClickLoad() {
        ul.innerHTML = "";

        const response = await fetch(url);
        const data = await response.json();
        
        Object.values(data).forEach(e => {
            const {person, phone, _id} = e;

            const li = createElement("li", `${person}: ${phone}`, ul);
            li.setAttribute("id", _id);

            const delButton = createElement("button", "Delete", li);
            delButton.setAttribute("id", "delButton");

            delButton.addEventListener("click", onClickDelete);
        })
    }

    async function onClickCreate() {
        if(person.value !== "" && phone.value !== "") {
            await fetch(url, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({person:person.value, phone:phone.value})
            })
        }
        loadButton.click();
        person.value = "";
        phone.value = "";
    }

    async function onClickDelete(ev) {
        const id = ev.target.parentNode.id;
        ev.target.parentNode.remove();

        await fetch(`${url}/${id}`, {method: "DELETE"});
    }

    function createElement(type, text, appender) {
        const result = document.createElement(type);
        result.textContent = text;
        appender.appendChild(result);
        return result;
    }
}

attachEvents();