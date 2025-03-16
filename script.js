const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const sidebarToggle = document.getElementById('sidebar-toggle');
const modeToggle = document.getElementById('mode-toggle-checkbox');
const sidebar = document.getElementById('sidebar');
const resizeHandle = document.getElementById('resize-handle');
const chatContainer = document.querySelector('.chat-container');
let conversation = []; // Array para almacenar los mensajes

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
    const collapsedWidth = 70; // Ancho cuando está colapsado

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
});

/*- - - - - -- - - - - - -- - -- -- - - -- - - - - --  - - - - --- - - - - - */
/* Esto está añadido para supuestamente cargar los pacientes de la base de datos*/ 
async function loadPatients() {
    try {
        // Reemplaza esta URL con la de tu backend
        const response = await fetch('http://127.0.0.1:5000/pacientes'); 

        if (!response.ok) {
            throw new Error('Error al obtener los datos de los pacientes');
        }

        const patients = await response.json(); // Convertimos la respuesta en JSON
        updatePatientsTable(patients);
    } catch (error) {
        console.error('Error:', error);
    }
}

function updatePatientsTable(patients) {
    const table = document.getElementById("table");

    // Limpiar la tabla antes de actualizarla
    table.innerHTML = `
        <tr class="titles">
            <th style="width: 40%">Nombre</th>
            <th style="width: 40%">Apellidos</th>
            <th style="width: 20%">DNI</th>
        </tr>
    `;

    // Insertar cada paciente en la tabla
    patients.forEach(patient => {
        let row = table.insertRow(-1);
        row.innerHTML = `
            <td>${patient.nombre}</td>
            <td>${patient.apellidos}</td>
            <td>${patient.dni}</td>
        `;
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
    conversation.push({ sender, message }); // Almacenar mensaje en el array
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

// For edit item 
let index = -1; 
const table = document.getElementById("table"); 
  
// For sorting ascending or descending 
const flag = { Name: false, DNI: false,get DNI() {
        return this.DNI;
    },
set DNI(value) {
    this.DNI = value;
    },
 Year: false }; 
let data = [ 
    { Name: "HTML", DNI: "Web", Year: "1993" }, 
    { 
        Name: "Java", 
        DNI: "Programming", 
        Year: "1995", 
    }, 
    { Name: "JavaScript", DNI: "Web", Year: "1995" }, 
    { Name: "MongoDB", DNI: "Database", Year: "2007" }, 
    { Name: "Python", DNI: "Programming", Year: "1991" }, 
]; 
  
// To switch update or add form 
const switchEdit = () => { 
    document.getElementById("submitItem").style.display = "none"; 
    document.getElementById("editItem").style.display = ""; 
}; 
  
const switchAdd = () => { 
    document.getElementById("submitItem").style.display = ""; 
    document.getElementById("editItem").style.display = "none"; 
}; 
  
// To create table 
function addItem(e, i) { 
    row = table.insertRow(i + 1); 
    let c0 = row.insertCell(0); 
    let c1 = row.insertCell(1); 
    let c2 = row.insertCell(2); 
    let c3 = row.insertCell(3); 
    c4 = row.insertCell(4); 
    c5 = row.insertCell(5); 
    c0.innerText = i + 1; 
    c1.innerText = e.Name; 
    c2.innerText = e.DNI; 
    c3.innerText = e.Year; 
    c4.innerHTML = "✍"; 
    c5.innerHTML = "☒"; 
    c4.classList.add("zoom"); 
    c5.classList.add("zoom"); 
    c4.addEventListener("click", () => edit(c4, i)); 
    c5.addEventListener("click", () => del(e)); 
} 
  
// Traverse and insert items to table 
data.map((e, i) => addItem(e, i)); 
  
// For sorting in different cases 
function sortItems(title) { 
    remove(); 
    switch (title) { 
        case "name": 
            sortName(); 
            break; 
        case "DNI": 
            sortDNI(); 
            break; 
        case "year": 
            sortYear(); 
            break; 
        default: 
            console.log("Default"); 
    } 
    data.map((e, i) => addItem(e, i)); 
} 
  
// Clear the table before updation 
function remove() { 
    console.log("removed"); 
    while (table.rows.length > 1) table.deleteRow(-1); 
} 
  
// Sort with names 
function sortName() { 
    data.sort((a, b) => { 
        let fa = a.Name.toLowerCase(), 
            fb = b.Name.toLowerCase(); 
        console.log(fa, fb); 
  
        if (fa < fb) { 
            return -1; 
        } 
        if (fa > fb) { 
            return 1; 
        } 
        return 0; 
    }); 
    if (flag.Name) data.reverse(); 
    flag.Name = !flag.Name; 
} 
  
// Sort with DNI 
function sortDNI() { 
    data.sort((a, b) => { 
        let fa = a.DNI.toLowerCase(), 
            fb = b.DNI.toLowerCase(); 
        console.log(fa, fb); 
  
        if (fa < fb) { 
            return -1; 
        } 
        if (fa > fb) { 
            return 1; 
        } 
        return 0; 
    }); 
    if (flag.DNI) data.reverse(); 
    flag.DNI = !flag.DNI; 
} 
  
// Sort with year 
function sortYear() { 
    data.sort((a, b) => a.Year - b.Year); 
    if (flag.Year) data.reverse(); 
    flag.Year = !flag.Year; 
} 
  
// To search and filter items 
function searchItems() { 
    let input = document 
        .getElementById("searchInput") 
        .value.toLowerCase(); 
    let filterItems = data.filter((e) => { 
        return ( 
            e.Name.toLowerCase().includes(input) || 
            e.DNI.toLowerCase().includes(input) || 
            e.Year.includes(input) 
        ); 
    }); 
  
    remove(); 
    filterItems.map((e, i) => addItem(e, i)); 
} 
  
// Initiate edit form 
function edit(c, i) { 
    console.log(c.classList.value); 
    if (c.classList.value === "zoom") { 
        c.classList.add("open"); 
        el = data[i]; 
        switchEdit(); 
  
        let nameInput = document.getElementById("nameInput"); 
        let DNIInput = document.getElementById("DNIInput"); 
        let yearInput = document.getElementById("yearInput"); 
        nameInput.value = el.Name; 
        DNIInput.value = el.DNI; 
        yearInput.value = el.Year; 
        index = i; 
    } else { 
        c.classList.value = "zoom"; 
        switchAdd(); 
  
        document.getElementById("nameInput").value = ""; 
        document.getElementById("DNIInput").value = ""; 
        document.getElementById("yearInput").value = ""; 
        index = -1; 
    } 
} 
  
// Submit edit data 
function editItem() { 
    console.log("edit"); 
    nameInput = document.getElementById("nameInput"); 
    DNIInput = document.getElementById("DNIInput"); 
    yearInput = document.getElementById("yearInput"); 
    data[index] = { 
        Name: nameInput.value, 
        DNI: DNIInput.value, 
        Year: yearInput.value, 
    }; 
    remove(); 
    data.map((e, i) => addItem(e, i)); 
  
    nameInput.value = ""; 
    DNIInput.value = ""; 
    yearInput.value = ""; 
    switchAdd(); 
} 
  
// Add new data 
function submitItem() { 
    console.log("submit clicked"); 
    nameInput = document.getElementById("nameInput").value; 
    DNIInput = document.getElementById("DNIInput").value; 
    yearInput = document.getElementById("yearInput").value; 
    if ( 
        nameInput === "" || 
        DNIInput === "" || 
        yearInput === ""
    ) { 
        window.alert("incomplete input data"); 
        return; 
    } 
    data.push({ 
        Name: nameInput, 
        DNI: DNIInput, 
        Year: yearInput, 
    }); 
    document.getElementById("nameInput").value = ""; 
    document.getElementById("DNIInput").value = ""; 
    document.getElementById("yearInput").value = ""; 
    remove(); 
    data.map((e, i) => addItem(e, i)); 
    console.log(data); 
} 
  
// Delete specific field 
function del(el) { 
    console.log("del clicked", el); 
    remove(); 
    data = data.filter((e) => e.Name !== el.Name); 
    data.map((e, i) => addItem(e, i)); 
}