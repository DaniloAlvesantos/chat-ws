const socket = io();
let state = {
  roomData: null,
  clientQuant: 0,
  currentUsername: null,
  currentRoom: null,
};
const app = document.querySelector("#app");

const form = document.querySelector("form");
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());
  socket.emit("room", {
    username: data.username,
    room: data.room,
  });

  state.currentUsername = data.username;
  state.currentRoom = data.room;

  form.remove();

  app.innerHTML += `
    <section class="card container w-md-50">
      <div id="room-info">
        <h2>Chat: <strong id="chat">${data.room}</strong></h2>
        <p>Clients Quantity: <strong id="clientsQuant"></strong></p>
      </div>

      <main></main>
    </section>
    `;

  createUI();
});

socket.on("room-info", (d) => {
  const data = d.clients;
  state.roomData = data;
  state.clientQuant = data.length;
  console.log(d);
  document.querySelector("#clientsQuant").textContent = state.clientQuant;
  if (d.messages.length) {
    renderMessages(d.messages);
  }
});

function createUI() {
  const messageContainer = `<main id="message-container" class="container p-1"></main>`;
  const textContainer = `<section class="fixed-bottom p-4">
  <form class="input-group container" id="chat-form">
    <input type="text" class="form-control" id="message-input" />
    <button class="btn btn-warning col-2 rounded-end" id="message-button" type="submit">
      Enviar
     <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-send"
              viewBox="0 0 16 16"
            >
              <path
                d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z"
              />
            </svg>
    </button>
  </form>
</section>`;

  app.innerHTML += messageContainer;
  app.innerHTML += textContainer;
  document.querySelector("#chat-form").addEventListener("submit", sendMessage);
}

/**
 * @param {Event} e
 */
function sendMessage(e) {
  e.preventDefault();
  /**
   * @constant
   * @type {HTMLInputElement}
   */
  const messageInput = document.querySelector("#message-input");

  if (!messageInput.value.length || messageInput.value === "") return;

  const data = {
    username: state.currentUsername,
    text: messageInput.value,
    room: state.currentRoom,
  };

  socket.emit("message", data);
  messageInput.value = "";
}

/**
 * @param {Date} createdAt
 * @param {String} text
 * @param {String} username
 */

function createMessage(text, username, createdAt) {
  const messageContainer = document.querySelector("#message-container");

  const wrapper = document.createElement("div");
  wrapper.classList.add(
    "d-flex",
    username === state.currentUsername
      ? "justify-content-end"
      : "justify-content-start",
    "mb-2"
  );

  const bubble = document.createElement("div");
  bubble.classList.add("p-2", "rounded-3", "shadow-sm", "text-white");
  bubble.style.maxWidth = "70%";

  bubble.classList.add("bg-primary");

  const msgText = document.createElement("p");
  msgText.classList.add("mb-1");
  msgText.textContent = text;

  const meta = document.createElement("small");
  meta.classList.add("text-light", "d-block", "text-end");
  meta.textContent = `${username} • ${createdAt}`;

  bubble.appendChild(msgText);
  bubble.appendChild(meta);
  wrapper.appendChild(bubble);
  messageContainer.appendChild(wrapper);

  messageContainer.scrollTop = messageContainer.scrollHeight;
}

function renderMessages(messages) {
  messages.forEach((msg) => {
    createMessage(msg.text, msg.username, msg.createdAt);
  });
}

socket.on("message", (data) => {
  if (data.room !== state.currentRoom) return;
  createMessage(data.text, data.username, data.createdAt);
});
