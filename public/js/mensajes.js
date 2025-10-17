// public/js/mensajes.js

const API_URL = "http://localhost:3005/api";

document.addEventListener("DOMContentLoaded", async function () {
  let userData;
  try {
    userData = JSON.parse(localStorage.getItem("userData"));
  } catch (error) {
    window.location.href = "index.html";
    return;
  }

  if (!userData) {
    window.location.href = "index.html";
    return;
  }

  displayUserInfo(userData);

  await loadContactsAndHandleNewChat();

  document
    .getElementById("logout-button")
    .addEventListener("click", function () {
      localStorage.removeItem("userData");
      window.location.href = "index.html";
    });

  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");
  sidebar.classList.remove("collapsed");
  mainContent.classList.remove("expanded");
});

function displayUserInfo(userData) {
  document.getElementById("sidebar-user-name").textContent =
    userData.username || "Usuario";
  document.getElementById("sidebar-user-role").textContent =
    userData.role === "student" ? "Estudiante" : "Tutor";

  const userAvatar = document.getElementById("sidebar-user-avatar");
  if (userData.profile && userData.profile.firstName) {
    const initials = `${userData.profile.firstName.charAt(0)}${
      userData.profile.lastName ? userData.profile.lastName.charAt(0) : ""
    }`;
    userAvatar.textContent = initials.toUpperCase();
  } else {
    userAvatar.textContent = userData.username.charAt(0).toUpperCase();
  }
}

async function loadContactsAndHandleNewChat() {
  const contacts = await loadContacts();
  checkForNewChat(contacts);
}

async function loadContacts() {
  const contactsContainer = document.getElementById("contacts-container");
  contactsContainer.innerHTML = "<p>Cargando contactos...</p>";

  try {
    const response = await fetch(`${API_URL}/conversations`, {
      credentials: "include",
    });
    const result = await response.json();

    if (!response.ok || !result.ok) {
      throw new Error(result.msg || "Error al cargar contactos");
    }

    displayContacts(result.data);
    return result.data || [];
  } catch (error) {
    contactsContainer.innerHTML = `<p class="error-message">${error.message}</p>`;
    return [];
  }
}

function checkForNewChat(existingContacts) {
  const newChatDataString = localStorage.getItem("start_chat_with");
  if (!newChatDataString) {
    return;
  }

  localStorage.removeItem("start_chat_with");
  const newContact = JSON.parse(newChatDataString);

  const contactExists = existingContacts.find((c) => c.id === newContact.id);

  if (contactExists) {
    const contactElement = document.querySelector(
      `.contact-item[data-id="${newContact.id}"]`
    );
    if (contactElement) {
      contactElement.click();
    }
  } else {
    const contactsContainer = document.getElementById("contacts-container");

    const contactItem = document.createElement("div");
    contactItem.className = "contact-item";
    contactItem.dataset.id = newContact.id;
    contactItem.dataset.role = newContact.role;
    contactItem.innerHTML = `
            <div class="contact-avatar">${newContact.avatar}</div>
            <div class="contact-info">
                <div class="contact-name">
                    <span>${newContact.name}</span>
                    <span class="time"></span>
                </div>
                <div class="contact-preview">Inicia la conversación...</div>
            </div>
        `;

    contactsContainer.prepend(contactItem);

    contactItem.addEventListener("click", function () {
      document
        .querySelectorAll(".contact-item")
        .forEach((item) => item.classList.remove("active"));
      contactItem.classList.add("active");
      loadConversation(newContact);
    });

    contactItem.click();
  }
}

function displayContacts(contacts) {
  const contactsContainer = document.getElementById("contacts-container");
  contactsContainer.innerHTML = "";

  if (!contacts || contacts.length === 0) {
    contactsContainer.innerHTML =
      '<div style="padding: 20px; text-align: center;">No tienes conversaciones.</div>';
    return;
  }

  contacts.forEach((contact) => {
    const contactItem = document.createElement("div");
    contactItem.className = "contact-item";
    contactItem.dataset.id = contact.id;
    contactItem.dataset.role = contact.role;

    contactItem.innerHTML = `
            <div class="contact-avatar">${contact.avatar}</div>
            <div class="contact-info">
                <div class="contact-name">
                    <span>${contact.name}</span>
                    <span class="time">${new Date(
                      contact.time
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}</span>
                </div>
                <div class="contact-preview">${contact.lastMessage}</div>
            </div>
        `;

    contactItem.addEventListener("click", function () {
      document
        .querySelectorAll(".contact-item")
        .forEach((item) => item.classList.remove("active"));
      contactItem.classList.add("active");
      loadConversation(contact);
    });

    contactsContainer.appendChild(contactItem);
  });
}

async function loadConversation(contact) {
  const chatArea = document.getElementById("chat-area");
  chatArea.innerHTML = `<p>Cargando mensajes...</p>`;

  try {
    const response = await fetch(`${API_URL}/conversations/${contact.id}`, {
      credentials: "include",
    });
    const result = await response.json();

    if (!response.ok || !result.ok) {
      throw new Error(result.msg || "Error al cargar la conversación");
    }

    displayConversation(contact, result.data);
  } catch (error) {
    chatArea.innerHTML = `<p class="error-message">${error.message}</p>`;
  }
}

function displayConversation(contact, messages) {
  const chatArea = document.getElementById("chat-area");
  const currentUser = JSON.parse(localStorage.getItem("userData"));

  chatArea.innerHTML = `
        <div class="chat-header">
            <div class="contact-avatar">${contact.avatar}</div>
            <div class="contact-info">
                <h3>${contact.name}</h3>
                <p>${contact.role}</p>
            </div>
        </div>
        <div class="chat-messages" id="chat-messages"></div>
        <div class="chat-input">
            <input type="text" placeholder="Escribe un mensaje..." id="message-input">
            <button id="send-button"><i class="fas fa-paper-plane"></i></button>
        </div>
    `;

  const chatMessages = document.getElementById("chat-messages");
  messages.forEach((message) => {
    const messageElement = document.createElement("div");
    const messageType =
      message.senderId === currentUser.id ? "sent" : "received";
    messageElement.className = `message ${messageType}`;

    messageElement.innerHTML = `
            <div class="message-content">${message.content}</div>
            <div class="message-time">${new Date(
              message.createdAt
            ).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}</div>
        `;

    chatMessages.appendChild(messageElement);
  });

  chatMessages.scrollTop = chatMessages.scrollHeight;

  const messageInput = document.getElementById("message-input");
  const sendButton = document.getElementById("send-button");

  const sendMessage = async () => {
    const content = messageInput.value.trim();
    if (content) {
      // ✅ CORRECCIÓN: Nos aseguramos que el 'role' (que será el receiverModel)
      // siempre empiece con mayúscula para que coincida con el modelo del backend.
      const receiverRole =
        contact.role.charAt(0).toUpperCase() + contact.role.slice(1);

      const body = {
        receiverId: contact.id,
        receiverModel: receiverRole,
        content: content,
      };

      try {
        await fetch(`${API_URL}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        });
        messageInput.value = "";
        loadConversation(contact);
      } catch (error) {
        console.error("Error al enviar mensaje:", error);
      }
    }
  };

  sendButton.addEventListener("click", sendMessage);
  messageInput.addEventListener(
    "keypress",
    (e) => e.key === "Enter" && sendMessage()
  );
}