let stompClient = null;

function connect() {
  const serverIp = document.getElementById("serverIp").value;
  const socket = new SockJS("http://" + serverIp + ":8080/chat");
  stompClient = Stomp.over(socket);

  stompClient.connect(
    {},
    function (frame) {
        setConnected(true);
        console.log("Connected: " + frame);
        stompClient.subscribe("/topic/public", function (message) {
            showMessage(JSON.parse(message.body));
        });
        const username = document.getElementById("username").value;
        stompClient.send(
            "/app/chat.addUser",
            {},
            JSON.stringify({
            tipo: "JOIN",
            usuario: username,
            }),
        );
    },
    function (error) {
        console.error("Error: " + error);
        setConnected(false);
    },
  );
}

function disconnect() {
    if (stompClient !== null) {
        stompClient.disconnect();
        stompClient = null;
    }
    setConnected(false);
    console.log("Disconnected");
}

function setConnected(connected) {
    const status = document.getElementById("status");
    if (connected) {
        status.className = "connected";
        status.textContent = "Conectado";
    } else {
        status.className = "disconnected";
        status.textContent = "Desconectado";
    }
    document.getElementById("message").disabled = !connected;
}

function sendMessage() {
    const username = document.getElementById("username").value;
    const content = document.getElementById("message").value;

    if (content.trim() === "") return;
    if (stompClient === null || !stompClient.connected) return;

    stompClient.send(
        "/app/chat.sendMessage",
        {},
        JSON.stringify({
        tipo: "CHAT",
        usuario: username,
        contenido: content,
        }),
    );

    document.getElementById("message").value = "";
}

function showMessage(message) {
    const messages = document.getElementById("messages");
    const messageDiv = document.createElement("div");
    messageDiv.className = "message";

    if (message.tipo === "JOIN") {
        messageDiv.textContent = message.usuario + " se unió al chat";
    } else {
        messageDiv.innerHTML =
        "<strong>" + message.usuario + ":</strong> " + message.contenido;
    }

    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
    }

    document.getElementById("message").addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            sendMessage();
        }
});
