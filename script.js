const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const sidebarToggle = document.getElementById('sidebar-toggle');
const modeToggle = document.getElementById('mode-toggle-checkbox');
const sidebar = document.getElementById('sidebar');
const resizeHandle = document.getElementById('resize-handle');
const chatContainer = document.querySelector('.chat-container');
let conversations = {};
let patientsData = [];
let currentPatientId = null;

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
    const loginContainer = document.getElementById("login-container");
    const appContainer = document.getElementById("app-container");
    const loginButton = document.getElementById("login-button");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const loginError = document.getElementById("login-error");
    const table = document.getElementById("table");

    const validUser = "admin";
    const validPassword = "1234";

    usernameInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            loginButton.click();
        }
    });
    
    passwordInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            loginButton.click();
        }
    });

    loginButton.addEventListener("click", function () {
        const enteredUser = usernameInput.value;
        const enteredPassword = passwordInput.value;

        if (enteredUser === validUser && enteredPassword === validPassword) {
            loginContainer.style.display = "none";
            appContainer.style.display = "block";
            const sidebarWidth = sidebar.offsetWidth;
            chatContainer.style.width = `calc(100% - ${sidebarWidth}px)`;
            chatContainer.style.marginLeft = `${sidebarWidth}px`;
            loadPatients();
            if (!conversations['general']) {
                conversations['general'] = [];
                appendMessage('The Bug Busters', 'Bienvenido al chat genérico. Puedes hacer preguntas generales o sobre cualquier paciente.');
                conversations['general'].push({ sender: 'The Bug Busters', message: 'Bienvenido al chat genérico. Puedes hacer preguntas generales o sobre cualquier paciente.' });
            }
            chatBox.innerHTML = '';
            conversations['general'].forEach(msg => appendMessage(msg.sender, msg.message));
        } else {
            loginError.style.display = "block";
        }
    });

    const menuBtn = document.getElementById('menu-btn');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const newConversationBtn = document.querySelector('.new-conversation');
    const saveConversationBtn = document.querySelector('.save-conversation');
    const loadConversationBtn = document.querySelector('.load-conversation');
    const loadFileInput = document.getElementById('load-file-input');

    let lastSidebarWidth = 450;
    const collapsedWidth = 50;

    sidebar.classList.add('collapsed');
sidebar.style.width = `${collapsedWidth}px`;
chatContainer.style.marginLeft = `${collapsedWidth}px`;
chatContainer.style.width = `calc(100% - ${collapsedWidth}px)`;
resizeHandle.style.pointerEvents = 'none'; // Deshabilitar redimensionamiento desde el inicio

sidebarToggle.addEventListener('click', function () {
    if (sidebar.classList.contains('collapsed')) {
        sidebar.style.width = `${lastSidebarWidth}px`;
        chatContainer.style.marginLeft = `${lastSidebarWidth}px`;
        chatContainer.style.width = `calc(100% - ${lastSidebarWidth}px)`;
        resizeHandle.style.pointerEvents = 'auto'; // Habilitar redimensionamiento
    } else {
        lastSidebarWidth = sidebar.offsetWidth;
        sidebar.style.width = `${collapsedWidth}px`;
        chatContainer.style.marginLeft = `${collapsedWidth}px`;
        chatContainer.style.width = `calc(100% - ${collapsedWidth}px)`;
        resizeHandle.style.pointerEvents = 'none'; // Deshabilitar redimensionamiento
    }
    sidebar.classList.toggle('collapsed');
});

resizeHandle.addEventListener('mousedown', (e) => {
    if (sidebar.classList.contains('collapsed')) return; // Evita la redimensión si está colapsado
    isResizing = true;
    e.preventDefault();
});
    

    let isResizing = false;

    menuBtn.addEventListener('click', () => {
        dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', (e) => {
        if (!menuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.style.display = 'none';
        }
    });

    newConversationBtn.addEventListener('click', function () {
        if (currentPatientId) {
            conversations[currentPatientId] = [];
            chatBox.innerHTML = '';
            appendMessage('The Bug Busters', `Nueva conversación iniciada para el paciente ${currentPatientId}`);
        } else {
            conversations['general'] = [];
            chatBox.innerHTML = '';
            appendMessage('The Bug Busters', '¡Nueva conversación genérica iniciada!');
        }
        dropdownMenu.style.display = 'none';
    });

    saveConversationBtn.addEventListener('click', function () {
        saveConversation();
        dropdownMenu.style.display = 'none';
    });

    loadConversationBtn.addEventListener('click', () => {
        loadFileInput.click();
        dropdownMenu.style.display = 'none';
    });

    loadFileInput.addEventListener('change', loadConversation);

    modeToggle.addEventListener('change', function () {
        chatContainer.classList.toggle('light-mode');
        chatContainer.classList.toggle('dark-mode');
    });

    table.addEventListener("click", function (event) {
        let clickedRow = event.target.closest("tr");
        if (clickedRow && !clickedRow.classList.contains("titles")) {
            document.querySelectorAll("#table tr").forEach(row => row.classList.remove("active"));
            clickedRow.classList.add("active");
        }
    });
});

async function loadPatients() {
    try {
        const response = await fetch('http://127.0.0.1:5000/get_patients');
        if (!response.ok) {
            throw new Error('Error al obtener los datos de los pacientes');
        }
        patientsData = await response.json();
        updatePatientsTable(patientsData);
    } catch (error) {
        console.error('Error:', error);
    }
}

function updatePatientsTable(patients) {
    const table = document.getElementById("table");
    table.innerHTML = `
        <tr class="titles">
            <th style="width: 20%">ID</th>
            <th style="width: 35%">Apellido</th>
            <th style="width: 35%">Nombre</th>
            <th style="width: 10%">Informe</th>
        </tr>
    `;

    patients.forEach(patient => {
        let row = table.insertRow(-1);
        row.innerHTML = `
            <td>${patient.id}</td>
            <td>${patient.apellido}</td>
            <td>${patient.nombre}</td>
            <td>
                <button class="note-button" onclick="generatePatientReport(${patient.id})">
                    📝
                </button>
            </td>
        `;
        row.addEventListener('click', () => selectPatient(patient.id));
    });
}

async function generatePatientReport(patientId) {
    const selectedPatient = patientsData.find(p => p.id === patientId);
    if (!selectedPatient) {
        alert("Paciente no encontrado.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Informe del Paciente", 20, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`ID: ${selectedPatient.id}`, 20, 40);
    doc.text(`Nombre: ${selectedPatient.nombre}`, 20, 50);
    doc.text(`Apellido: ${selectedPatient.apellido}`, 20, 60);

    if (conversations[patientId] && conversations[patientId].length > 0) {
        doc.text("Historial de conversación:", 20, 80);
        let y = 90;
        conversations[patientId].forEach(msg => {
            doc.text(`${msg.sender}: ${msg.message}`, 20, y);
            y += 10;
            if (y > 280) {
                doc.addPage();
                y = 20;
            }
        });
    }

    doc.save(`Informe_${selectedPatient.nombre}_${selectedPatient.apellido}.pdf`);
}

function selectPatient(patientId) {
    const selectedPatient = patientsData.find(patient => patient.id === patientId);
    if (!selectedPatient) return;

    currentPatientId = patientId;
    console.log("Paciente seleccionado:", selectedPatient);

    if (!conversations[patientId]) {
        conversations[patientId] = [];
        conversations[patientId].push({
            sender: 'The Bug Busters',
            message: `Iniciando conversación sobre el paciente ${selectedPatient.nombre} ${selectedPatient.apellido} (ID: ${patientId})`
        });
    }

    chatBox.innerHTML = '';
    conversations[patientId].forEach(msg => appendMessage(msg.sender, msg.message));
}

async function sendMessage() {
    const message = userInput.value.trim();
    if (message === '') return;

    const conversationKey = currentPatientId === null ? 'general' : currentPatientId;
    if (!conversations[conversationKey]) {
        conversations[conversationKey] = [];
    }

    appendMessage('User', message);
    conversations[conversationKey].push({ sender: 'User', message });
    userInput.value = '';

    const typingMessage = document.createElement('div');
    typingMessage.classList.add('message', 'system-message', 'typing');
    chatBox.appendChild(typingMessage);
    chatBox.scrollTop = chatBox.scrollHeight;

    let dots = 0;
    const typingInterval = setInterval(() => {
        dots = (dots + 1) % 4;
        typingMessage.textContent = 'Escribiendo' + '.'.repeat(dots);
    }, 500);

    try {
        // Obtener los últimos 10 mensajes de la conversación actual
        const recentMessages = conversations[conversationKey].slice(-10).map(msg => ({
            role: msg.sender === 'User' ? 'user' : 'assistant',
            content: msg.message
        }));

        const requestBody = {
            message,
            history: recentMessages
        };
        if (currentPatientId !== null) {
            requestBody.patientId = currentPatientId;
        }
        console.log("Enviando mensaje con patientId:", currentPatientId, "y historial:", recentMessages);

        const response = await fetch('http://127.0.0.1:5000/send_message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }

        const data = await response.json();
        clearInterval(typingInterval);
        chatBox.removeChild(typingMessage);

        if (data.error) {
            appendMessage('The Bug Busters', `Error: ${data.error}`);
            conversations[conversationKey].push({ sender: 'The Bug Busters', message: `Error: ${data.error}` });
        } else {
            appendMessage('The Bug Busters', data.response);
            conversations[conversationKey].push({ sender: 'The Bug Busters', message: data.response });
        }
    } catch (error) {
        console.error('Error:', error);
        chatBox.removeChild(typingMessage);
        appendMessage('The Bug Busters', 'Hubo un error al conectar con el servidor.');
        conversations[conversationKey].push({ sender: 'The Bug Busters', message: 'Hubo un error al conectar con el servidor.' });
    }
}

function appendMessage(sender, message) {
    const div = document.createElement('div');
    div.innerHTML = message.replace(/\n/g, '<br>');
    div.classList.add('message');
    if (sender === 'User') {
        div.classList.add('user-message');
    } else {
        div.classList.add('system-message');
    }
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function saveConversation() {
    const conversationKey = currentPatientId === null ? 'general' : currentPatientId;
    if (!conversations[conversationKey] || conversations[conversationKey].length === 0) {
        alert('No hay conversación activa para guardar. Envía un mensaje primero.');
        return;
    }
    const json = JSON.stringify(conversations[conversationKey], null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation_${conversationKey}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function loadConversation(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const loadedConversation = JSON.parse(e.target.result);
            const conversationKey = currentPatientId === null ? 'general' : currentPatientId;
            conversations[conversationKey] = loadedConversation;
            chatBox.innerHTML = '';
            conversations[conversationKey].forEach(msg => appendMessage(msg.sender, msg.message));
        } catch (error) {
            appendMessage('The Bug Busters', 'Error al cargar el archivo: formato inválido.');
            console.error(error);
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

function searchItems() {
    let input = document.getElementById("searchInput").value.toLowerCase();
    let filteredPatients;

    if (!isNaN(input)) {
        filteredPatients = patientsData.filter((patient) => {
            return patient.id.toString().includes(input);
        });
    } else {
        filteredPatients = patientsData.filter((patient) => {
            const apellidoMatches = patient.apellido.toLowerCase().slice(0, input.length) === input;
            const nombreMatches = patient.nombre.toLowerCase().slice(0, input.length) === input;
            return apellidoMatches || nombreMatches;
        });
    }
    updatePatientsTable(filteredPatients);
}