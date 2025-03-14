const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const sidebarToggle = document.getElementById('sidebar-toggle');
const modeToggle = document.getElementById('mode-toggle-checkbox');
const sidebar = document.querySelector('.sidebar');

modeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode');
});

sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const newConversationBtn = document.getElementById('new-conversation-btn');
    const conversationContent = document.querySelector('.conversation-content');
    const chatContainer = document.querySelector('.chat-container');

    sidebarToggle.addEventListener('click', function () {
        sidebar.classList.toggle('collapsed');

        if (sidebar.classList.contains('collapsed')) {
            chatContainer.style.width = '96%';
            chatContainer.style.marginLeft = '3%';
        } else {
            chatContainer.style.width = 'calc(100% - 300px)';
            chatContainer.style.marginLeft = '300px';
        }
    });

    newConversationBtn.addEventListener('click', function () {
        conversationContent.textContent = "New Conversation Started!";
    });

    modeToggle.addEventListener('change', function () {
        chatContainer.classList.toggle('light-mode');
        chatContainer.classList.toggle('dark-mode');
    });
});

async function sendMessage() {
    const message = userInput.value.trim();
    if (message === '') return;

    appendMessage('User', message);
    userInput.value = '';

    try {
        const response = await fetch('http://127.0.0.1:5000/send_message', { // Ajusta esto si el backend está en otro lado
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }

        const data = await response.json();
        
        if (data.error) {
            appendMessage('The Bug Busters', `Error: ${data.error}`);
        } else {
            appendMessage('The Bug Busters', data.response);
        }
    } catch (error) {
        console.error('Error:', error);
        appendMessage('The Bug Busters', 'Hubo un error al conectar con el servidor.');
    }
}

function appendMessage(sender, message) {
    const p = document.createElement('p');
    p.textContent = `${sender}: ${message}`;
    chatBox.appendChild(p);
    chatBox.scrollTop = chatBox.scrollHeight;
}
