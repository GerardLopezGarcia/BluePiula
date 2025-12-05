// Array de imágenes ganadoras (con recompensa)  
const winningImages = [
    'assets/Screenshot_12.png',
    'assets/Screenshot_13.png',
    'assets/Screenshot_14.png',
    'assets/Screenshot_15.png',
    'assets/Screenshot_18.png',
    'assets/Screenshot_6.png',
    'assets/Screenshot_3.png'
];

// Array de imágenes del montón (random)
const randomImages = [
    'assets/Screenshot_1.png',
    'assets/Screenshot_2.png',
    'assets/Screenshot_4.png',
    'assets/Screenshot_5.png',
    'assets/Screenshot_7.png',
    'assets/Screenshot_8.png',
    'assets/Screenshot_9.png',
    'assets/Screenshot_10.png',
    'assets/Screenshot_11.png',
    'assets/Screenshot_16.png',
    'assets/Screenshot_17.png'
];

// Todas las imágenes combinadas (para referencia)
const allImages = [...winningImages, ...randomImages];

// Etiquetas para las habitaciones
const roomLabels = [
    'Walk-in Closet',
    'Morning Room',
    'Guest Bedroom',
    'Master Suite',
    'Library',
    'Study'
];

// Estado de la aplicación
let currentSelection = [];
let selectedImages = [];
let usedCards = []; // Registro de cards que ya han aparecido
let selectionCount = 0;
let stepsCount = 8;
let gameEnded = false;
let winCount = 0; // Contador de premios ganados

// Inicializar la aplicación
function init() {
    showRandomRooms();
    document.getElementById('resetBtn').addEventListener('click', reset);
    document.getElementById('endingResetBtn').addEventListener('click', reset);
    document.getElementById('winResetBtn').addEventListener('click', reset);
    updateStepsDisplay();
}

// Actualizar la visualización del contador de pasos
function updateStepsDisplay() {
    const stepsDisplay = document.getElementById('stepsCount');
    if (stepsDisplay) {
        stepsDisplay.textContent = stepsCount;
        // Añadir una pequeña animación al cambiar
        stepsDisplay.style.animation = 'none';
        setTimeout(() => {
            stepsDisplay.style.animation = 'pulse 0.3s ease';
        }, 10);
    }
}

// Obtener 3 imágenes aleatorias que no estén ya seleccionadas
function getThreeRandomImages() {
    // Obtener imágenes ganadoras que no hayan sido usadas
    const availableWinning = winningImages.filter(img => !usedCards.includes(img));
    
    // Obtener imágenes del montón que no hayan sido usadas
    const availableRandom = randomImages.filter(img => !usedCards.includes(img));
    
    let selection = [];
    
    // Garantizar al menos 1 ganadora
    if (availableWinning.length > 0) {
        const randomWinner = availableWinning[Math.floor(Math.random() * availableWinning.length)];
        selection.push(randomWinner);
    } else if (winningImages.length > 0) {
        // Si todas las ganadoras fueron usadas, traer una al azar (puede repetirse)
        const randomWinner = winningImages[Math.floor(Math.random() * winningImages.length)];
        selection.push(randomWinner);
    }
    
    // Completar con imágenes del montón (evitando duplicados en la selección)
    while (selection.length < 3) {
        let candidate;
        
        if (availableRandom.length > 0) {
            candidate = availableRandom[Math.floor(Math.random() * availableRandom.length)];
            // Remover de available para no duplicar en la misma selección
            availableRandom.splice(availableRandom.indexOf(candidate), 1);
        } else {
            // Si se acabaron las del montón, usar cualquiera (puede repetirse)
            candidate = randomImages[Math.floor(Math.random() * randomImages.length)];
        }
        
        // Evitar agregar dos veces la misma imagen en la selección
        if (!selection.includes(candidate)) {
            selection.push(candidate);
        }
    }
    
    // Mezclar la selección
    return selection.sort(() => Math.random() - 0.5);
}

// Mostrar 3 habitaciones aleatorias
function showRandomRooms() {
    const container = document.getElementById('roomsContainer');
    
    // Agregar animación de salida a las tarjetas anteriores
    const oldCards = container.querySelectorAll('.room-card');
    if (oldCards.length > 0) {
        oldCards.forEach(card => {
            card.style.animation = 'fadeOut 0.4s ease-out forwards';
        });
        
        setTimeout(() => {
            container.innerHTML = '';
            renderRooms();
        }, 400);
    } else {
        renderRooms();
    }
}

// Renderizar las tarjetas de habitaciones
function renderRooms() {
    const container = document.getElementById('roomsContainer');
    const rooms = getThreeRandomImages();
    
    rooms.forEach((image, index) => {
        const card = createRoomCard(image, index);
        container.appendChild(card);
    });
}

// Crear una tarjeta de habitación
function createRoomCard(imagePath, index) {
    const card = document.createElement('div');
    card.className = 'room-card';
    card.style.animationDelay = `${index * 0.15}s`;
    
    // Verificar si es una imagen ganadora
    const isWinning = winningImages.includes(imagePath);
    if (isWinning) {
        card.classList.add('winning-card');
    }
    
    const img = document.createElement('img');
    img.src = imagePath;
    img.alt = roomLabels[index];
    img.className = 'room-image';
    img.onerror = () => {
        img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="280" height="280"%3E%3Crect fill="%23333" width="280" height="280"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23fff" font-size="16"%3EImage not found%3C/text%3E%3C/svg%3E';
    };
    
    const label = document.createElement('div');
    label.className = 'room-label';
    label.textContent = roomLabels[index];
    
    card.appendChild(img);
    card.appendChild(label);
    
    card.addEventListener('click', () => {
        // Registrar que esta card fue usada
        if (!usedCards.includes(imagePath)) {
            usedCards.push(imagePath);
        }
        
        selectedImages.push(imagePath);
        selectionCount++;
        stepsCount--;
        
        // Verificar si es ganadora y sumar puntos
        if (isWinning) {
            winCount++;
            updateKeysRow();
            // Verificar si se ganaron todas las cartas ganadoras
            if (winCount === winningImages.length) {
                gameEnded = true;
                showWinScreen();
                return; // Salir sin mostrar más cartas
            }
        }
        
        updateStepsDisplay();
        
        // Verificar si se acabaron los pasos (exactamente en 0)
        if (stepsCount === 0) {
            gameEnded = true;
            showEndingScreen();
        } else {
            showRandomRooms();
        }
    });
    
    return card;
}

// Función para actualizar la fila de llaves (keysRow)
function updateKeysRow() {
    const keysRow = document.getElementById('keysRow');
    if (!keysRow) return;
    keysRow.innerHTML = '';
    for (let i = 0; i < winCount; i++) {
        const keyImg = document.createElement('img');
        keyImg.src = 'assets/keys.png';
        keyImg.alt = 'Key';
        keyImg.className = 'key-icon';
        keysRow.appendChild(keyImg);
    }
}

// Reiniciar la aplicación
function reset() {
    selectedImages = [];
    selectionCount = 0;
    stepsCount = 8;
    gameEnded = false;
    usedCards = []; // Limpiar registro de cards usadas
    winCount = 0; // Reiniciar contador de premios
    document.getElementById('roomsContainer').innerHTML = '';
    updateKeysRow();
    const endingOverlay = document.getElementById('endingOverlay');
    const winOverlay = document.getElementById('winOverlay');
    
    if (endingOverlay) {
        endingOverlay.classList.remove('show');
    }
    if (winOverlay) {
        winOverlay.classList.remove('show');
    }
    
    setTimeout(() => {
        updateStepsDisplay();
        showRandomRooms();
        updateKeysRow(); // Actualizar llaves al reiniciar
    }, 100);
}

// Mostrar pantalla de fin del juego (solo cuando stepsCount === 0)
function showEndingScreen() {
    const endingOverlay = document.getElementById('endingOverlay');
    if (endingOverlay && stepsCount === 0) {
        endingOverlay.classList.add('show');
    }
}

// Mostrar pantalla de victoria (cuando se ganan todas las cartas ganadoras)
function showWinScreen() {
    const winOverlay = document.getElementById('winOverlay');
    if (winOverlay && winCount === winningImages.length) {
        winOverlay.classList.add('show');
    }
}

// --- Lógica para mostrar/ocultar intro.png al clicar la gema ---
document.addEventListener('DOMContentLoaded', function() {
    const gemLogo = document.getElementById('gemLogo');
    const introModal = document.getElementById('introModal');
    const introModalBg = document.getElementById('introModalBg');
    if (gemLogo && introModal && introModalBg) {
        gemLogo.addEventListener('click', function(e) {
            introModal.classList.add('active');
        });
        introModalBg.addEventListener('click', function(e) {
            introModal.classList.remove('active');
        });
    }
});

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', init);
