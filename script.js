const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const sidebarToggle = document.getElementById('sidebar-toggle');
const modeToggle = document.getElementById('mode-toggle-checkbox');
const sidebar = document.getElementById('sidebar');
const resizeHandle = document.getElementById('resize-handle');
const chatContainer = document.querySelector('.chat-container');
let conversation = []; // Array para almacenar los mensajes
let patientsData = []; // Almacenar pacientes obtenidos del backend

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
    loadPatients();
    const menuBtn = document.getElementById('menu-btn');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const newConversationBtn = document.querySelector('.new-conversation');
    const saveConversationBtn = document.querySelector('.save-conversation');
    const loadConversationBtn = document.querySelector('.load-conversation');
    const loadFileInput = document.getElementById('load-file-input');

    let lastSidebarWidth = 450; // Ancho por defecto al expandirse
    const collapsedWidth = 50; // Ancho cuando está colapsado

    // Al cargar, inicializamos el sidebar colapsado
    sidebar.classList.add('collapsed');
    sidebar.style.width = `${collapsedWidth}px`;
    chatContainer.style.marginLeft = `${collapsedWidth}px`;
    chatContainer.style.width = `calc(100% - ${collapsedWidth}px)`;

    sidebarToggle.addEventListener('click', function () {
        if (sidebar.classList.contains('collapsed')) {
            // Expandir sidebar al último tamaño usado
            sidebar.style.width = `${lastSidebarWidth}px`;
            chatContainer.style.marginLeft = `${lastSidebarWidth}px`;
            chatContainer.style.width = `calc(100% - ${lastSidebarWidth}px)`;
        } else {
            // Guardar el tamaño antes de colapsarlo
            lastSidebarWidth = sidebar.offsetWidth;
            sidebar.style.width = `${collapsedWidth}px`;
            chatContainer.style.marginLeft = `${collapsedWidth}px`;
            chatContainer.style.width = `calc(100% - ${collapsedWidth}px)`;
        }
        sidebar.classList.toggle('collapsed');
    });

    // Mostrar/Ocultar menú desplegable
    menuBtn.addEventListener('click', () => {
        dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    });

    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!menuBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.style.display = 'none';
        }
    });

    // Lógica de redimensionamiento
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

    // Evento para el botón de nueva conversación
    newConversationBtn.addEventListener('click', function () {
        chatBox.innerHTML = '';
        conversation = [];
        appendMessage('The Bug Busters', '¡Nueva conversación iniciada!');
        dropdownMenu.style.display = 'none';
    });

    // Evento para guardar conversación
    saveConversationBtn.addEventListener('click', function () {
        saveConversation();
        dropdownMenu.style.display = 'none';
    });

    // Evento para cargar conversación
    loadConversationBtn.addEventListener('click', () => {
        loadFileInput.click();
        dropdownMenu.style.display = 'none';
    });
    loadFileInput.addEventListener('change', loadConversation);

    modeToggle.addEventListener('change', function () {
        chatContainer.classList.toggle('light-mode');
        chatContainer.classList.toggle('dark-mode');
    });

    // Ajustar el subheader cuando el sidebar cambie de tamaño
    window.addEventListener('resize', function() {
        let subHeader = document.getElementById('chat-subheader');
        if (subHeader) {
            subHeader.style.left = document.getElementById('sidebar').offsetWidth + 'px';
            subHeader.style.width = 'calc(100% - ' + document.getElementById('sidebar').offsetWidth + 'px)';
        }
    });
});

// Función para actualizar la posición del subheader dinámicamente
function updateSubHeaderPosition() {
    let subHeader = document.getElementById('chat-subheader');
    if (subHeader) {
        const sidebarWidth = document.getElementById('sidebar').offsetWidth;
        subHeader.style.left = `${sidebarWidth}px`;
        subHeader.style.width = `calc(100% - ${sidebarWidth}px)`;
    }
}

// Ajustar el subheader cuando el sidebar cambie de tamaño
window.addEventListener('resize', updateSubHeaderPosition);
document.getElementById('sidebar').addEventListener('transitionend', updateSubHeaderPosition);
document.getElementById('resize-handle').addEventListener('mousedown', () => {
    document.addEventListener('mousemove', updateSubHeaderPosition);
    document.addEventListener('mouseup', () => {
        document.removeEventListener('mousemove', updateSubHeaderPosition);
    }, { once: true });
});

/*- - - - - -- - - - - - -- - -- -- - - -- - - - - --  - - - - --- - - - - - */
/* Esto está añadido para supuestamente cargar los pacientes de la base de datos*/ 
async function loadPatients() {
    try {
        // Reemplaza esta URL con la de tu backend
        const response = await fetch('http://127.0.0.1:5000/get_patients'); 

        if (!response.ok) {
            throw new Error('Error al obtener los datos de los pacientes');
        }

        patientsData = await response.json(); // Guardamos los pacientes en la variable global
        updatePatientsTable(patientsData);
    } catch (error) {
        console.error('Error:', error);
    }
}

function updatePatientsTable(patients) {
    const table = document.getElementById("table");

    // Limpiar la tabla antes de actualizarla
    table.innerHTML = '';

    patients.forEach(patient => {
        let row = document.createElement("tr");
        let cell = document.createElement("td");
        cell.colSpan = 3; // Para ocupar todo el ancho

        // Crear un botón para cada paciente
        let button = document.createElement("button");
        button.classList.add("patient-button");
        button.innerHTML = `<strong>${patient.id}</strong> - ${patient.nombre} ${patient.apellido}`;
        button.onclick = function() {
            startNewConversation(patient);
        };

        // Estilos adicionales para el botón
        button.style.background = "transparent";
        button.style.border = "1px solid #f8f7f7";
        button.style.color = "#333";
        button.style.padding = "10px";
        button.style.width = "100%";
        button.style.textAlign = "left";
        button.style.cursor = "pointer";
        button.style.transition = "background 0.3s, color 0.3s";

        button.onmouseover = function() {
            button.style.background = "#4CAF50";
            button.style.color = "white";
        };
        button.onmouseout = function() {
            button.style.background = "transparent";
            button.style.color = "#333";
        };

        cell.appendChild(button);
        row.appendChild(cell);
        table.appendChild(row);
    });
}

/*- - - - - -- - - - - - -- - -- -- - - -- - - - - --  - - - - --- - - - - - */
async function sendMessage() {
    const message = userInput.value.trim();
    if (message === '') return;

    appendMessage('User', message);
    userInput.value = '';

    try {
        const response = await fetch('http://127.0.0.1:5000/send_message', {
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
    a.download = 'conversation.json';
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
            chatBox.innerHTML = ''; // Limpiar el chat actual
            conversation = loadedConversation; // Actualizar el array de conversación
            loadedConversation.forEach(msg => appendMessage(msg.sender, msg.message));
        } catch (error) {
            appendMessage('The Bug Busters', 'Error al cargar el archivo: formato inválido.');
            console.error(error);
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // Resetear el input file
}

function startNewConversation(patient) {
    const chatBox = document.getElementById('chat-box');
    const inputContainer = document.querySelector('.input-container');
    chatBox.innerHTML = '';


    let subHeader = document.getElementById('chat-subheader');
    if (!subHeader) {
        subHeader = document.createElement('div');
        subHeader.id = 'chat-subheader';
        subHeader.style.textAlign = 'center';
        subHeader.style.padding = '10px';
        subHeader.style.background = '#d6d6d6';
        subHeader.style.fontSize = '16px';
        subHeader.style.fontWeight = 'bold';
        subHeader.style.borderBottom = '1px solid transparent';
        subHeader.style.position = 'absolute';
        subHeader.style.top = '60px'; // Justo debajo del header
        subHeader.style.left = `${document.getElementById('sidebar').offsetWidth}px`; // Ajustar con el sidebar
        subHeader.style.maxWidth = 'calc(100% - 300px)'; // Limitar el ancho máximo
        subHeader.style.width = `calc(100% - ${document.getElementById('sidebar').offsetWidth}px)`; // Restar el ancho del sidebar
        subHeader.style.zIndex = '10';
        subHeader.style.overflow = 'hidden'; // Evitar que sobresalga
        subHeader.style.boxSizing = 'border-box'; // Ajustar correctamente
        
        document.querySelector('.chat-container').prepend(subHeader);
    }

    subHeader.innerHTML = `Conversación con <br> ${patient.id} - ${patient.nombre} ${patient.apellido}`;
    updateSubHeaderPosition(); // Ajustar posición inicial

    // Ajustar la altura del chat para que no se superponga con el subheader
    adjustChatBoxHeight();
}


function appendMessage(sender, message) {
    const chatBox = document.getElementById('chat-box');
    const div = document.createElement('div');
    div.textContent = message;
    div.classList.add('message', sender === 'User' ? 'user-message' : 'system-message');
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

/* Función para la búsqueda de pacientes */
function searchItems() {
    let input = document.getElementById("searchInput").value.toLowerCase();
    let filteredPatients;

    // Verificar si el input es un número
    if (!isNaN(input)) {
        // Si es un número, buscar en el ID
        filteredPatients = patientsData.filter((patient) => {
            return patient.id.toString().includes(input);
        });
    } else {
        // Si no es un número, buscar en las iniciales de nombre y apellido
        filteredPatients = patientsData.filter((patient) => {
            // Buscar en las iniciales de apellido (prioriza el apellido)
            const apellidoMatches = patient.apellido.toLowerCase().slice(0, input.length) === input;
            const nombreMatches = patient.nombre.toLowerCase().slice(0, input.length) === input;
            return apellidoMatches || nombreMatches;
        });
    }

    const tableContainer = document.getElementById('patients-table-container');
    const table = document.getElementById("table");
    const messageDiv = document.getElementById('no-results-message');

    if (filteredPatients.length === 0) {
        // Si no se encontraron resultados, ocultar las columnas y mostrar el mensaje
        table.innerHTML = '';
        if (!messageDiv) {
            const messageElement = document.createElement('div');
            messageElement.id = 'no-results-message';
            messageElement.style.textAlign = 'center';
            messageElement.style.marginTop = '20px';
            messageElement.textContent = 'No se encontraron resultados';
            tableContainer.appendChild(messageElement);
        }
    } else {
        // Si se encontraron resultados, mostrar la tabla
        updatePatientsTable(filteredPatients);
        if (messageDiv) {
            messageDiv.remove();
        }
    }
}

// Función para ajustar la altura del chat-box
function adjustChatBoxHeight() {
    let subHeader = document.getElementById('chat-subheader');
    let chatBox = document.getElementById('chat-box');
    let inputContainer = document.querySelector('.input-container');
    if (subHeader && chatBox && inputContainer) {
        const subHeaderHeight = subHeader.offsetHeight;
        chatBox.style.marginTop = `${subHeaderHeight}px`;
        inputContainer.style.marginTop = `${subHeaderHeight}px`;
    }
}

// Ajustar el subheader cuando el sidebar cambie de tamaño
window.addEventListener('resize', () => {
    updateSubHeaderPosition();
    adjustChatBoxHeight();
});
document.getElementById('sidebar').addEventListener('transitionend', () => {
    updateSubHeaderPosition();
    adjustChatBoxHeight();
});
document.getElementById('resize-handle').addEventListener('mousedown', () => {
    document.addEventListener('mousemove', () => {
        updateSubHeaderPosition();
        adjustChatBoxHeight();
    });
    document.addEventListener('mouseup', () => {
        document.removeEventListener('mousemove', updateSubHeaderPosition);
        document.removeEventListener('mousemove', adjustChatBoxHeight);
    }, { once: true });
});
