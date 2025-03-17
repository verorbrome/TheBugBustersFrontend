const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const sidebarToggle = document.getElementById('sidebar-toggle');
const modeToggle = document.getElementById('mode-toggle-checkbox');
const sidebar = document.getElementById('sidebar');
const resizeHandle = document.getElementById('resize-handle');
const chatContainer = document.querySelector('.chat-container');
let conversation = []; // Array para almacenar los mensajes del chat actual
let patientsData = []; // Almacenar pacientes obtenidos del backend
let currentPatientId = null; // ID del paciente seleccionado

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

    sidebarToggle.addEventListener('click', function () {
        if (sidebar.classList.contains('collapsed')) {
            sidebar.style.width = `${lastSidebarWidth}px`;
            chatContainer.style.marginLeft = `${lastSidebarWidth}px`;
            chatContainer.style.width = `calc(100% - ${lastSidebarWidth}px)`;
        } else {
            lastSidebarWidth = sidebar.offsetWidth;
            sidebar.style.width = `${collapsedWidth}px`;
            chatContainer.style.marginLeft = `${collapsedWidth}px`;
            chatContainer.style.width = `calc(100% - ${collapsedWidth}px)`;
        }
        sidebar.classList.toggle('collapsed');
    });

    let isResizing = false;

    resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (isResizing) {
            const newWidth = e.clientX;
            if (newWidth >= 50 && newWidth <= window.innerWidth * 0.8) {
                sidebar.style.width = `${newWidth}px`;
                chatContainer.style.marginLeft = `${newWidth}px`;
                chatContainer.style.width = `calc(100% - ${newWidth}px)`;
            }
        }
    });

    document.addEventListener('mouseup', () => {
        isResizing = false;
    });

    menuBtn.addEventListener('click', () => {
        dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', (e) => {
        if (!menuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.style.display = 'none';
        }
    });

    newConversationBtn.addEventListener('click', function () {
        chatBox.innerHTML = '';
        conversation = [];
        appendMessage('The Bug Busters', '¡Nueva conversación iniciada!');
        currentPatientId = null;
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
        let clickedRow = event.target.closest("tr"); // Detectar la fila clicada

        if (clickedRow && !clickedRow.classList.contains("titles")) { // Evita seleccionar la fila de títulos
            // Eliminar la clase 'active' de todas las filas
            document.querySelectorAll("#table tr").forEach(row => row.classList.remove("active"));

            // Agregar la clase 'active' a la fila clicada
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

    // 📝 Crear el documento PDF
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

    // 📥 Guardar el PDF con el nombre del paciente
    doc.save(`Informe_${selectedPatient.nombre}_${selectedPatient.apellido}.pdf`);
}



function selectPatient(patientId) {
    const selectedPatient = patientsData.find(patient => patient.id === patientId);
    if (!selectedPatient) return;

    currentPatientId = patientId;
    chatBox.innerHTML = '';
    conversation = [];
    appendMessage('The Bug Busters', `Iniciando conversación sobre el paciente ${patientId} - ${selectedPatient.nombre} ${selectedPatient.apellido}`);
}

async function sendMessage() {
    const message = userInput.value.trim();
    if (message === '') return;

    appendMessage('User', message);
    conversation.push({ sender: 'User', message });
    userInput.value = '';

    // 🔴 Agregar mensaje de "Escribiendo..."
    const typingMessage = document.createElement('div');
    typingMessage.classList.add('message', 'system-message', 'typing');
    chatBox.appendChild(typingMessage);
    chatBox.scrollTop = chatBox.scrollHeight;

    let dots = 0;
    const typingInterval = setInterval(() => {
        dots = (dots + 1) % 4; // 0, 1, 2, 3 → 0, 1, 2, 3 → ...
        typingMessage.textContent = 'Escribiendo' + '.'.repeat(dots);
    }, 500);

    try {
        const response = await fetch('http://127.0.0.1:5000/send_message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, patientId: currentPatientId })
        });

        if (!response.ok) {
            throw new Error('Error en la respuesta del servidor');
        }

        const data = await response.json();
        clearInterval(typingInterval);
        chatBox.removeChild(typingMessage); // ❌ Eliminar el mensaje de "Escribiendo..."

        if (data.error) {
            appendMessage('The Bug Busters', `Error: ${data.error}`);
        } else {
            appendMessage('The Bug Busters', data.response);
        }
        conversation.push({ sender: 'The Bug Busters', message: data.response || data.error });
    } catch (error) {
        console.error('Error:', error);
        chatBox.removeChild(typingMessage); // ❌ Asegurar que se elimine el mensaje de "Escribiendo..."
        appendMessage('The Bug Busters', 'Hubo un error al conectar con el servidor.');
        conversation.push({ sender: 'The Bug Busters', message: 'Hubo un error al conectar con el servidor.' });
    }
}


function appendMessage(sender, message) {
    const div = document.createElement('div');
    div.textContent = message;
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
    if (conversation.length === 0) {
        alert('No hay mensajes para guardar.');
        return;
    }
    const json = JSON.stringify(conversation, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentPatientId ? `conversation_${currentPatientId}.json` : 'conversation.json';
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
            chatBox.innerHTML = '';
            conversation = loadedConversation;
            loadedConversation.forEach(msg => appendMessage(msg.sender, msg.message));
            currentPatientId = null;
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
