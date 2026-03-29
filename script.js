// --- CONFIGURACIÓN ---
// ID limpio de la playlist
const PLAYLIST_ID = 'PLFEuxzsi8MWO4LB3EY7eV8OZClEsHX4f4';

// Variables globales
let player;
let lyricsData = letrasGuardadas;
const colorThief = new ColorThief();

// Elementos del DOM
const albumArt = document.getElementById('album-art');
const songTitle = document.getElementById('song-title');
const lyricsContent = document.getElementById('lyrics-content');
const btnPlay = document.getElementById('btn-play');
const iconPlay = btnPlay.querySelector('i');



// 2. Inicializar la API de YouTube (Esta función la llama la API de Google automáticamente)
function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '0',
        width: '0',
        playerVars: {
            listType: 'playlist',
            list: PLAYLIST_ID,
            loop: 1,
            autoplay: 0,
            controls: 0,
            disablekb: 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

// 3. Configurar los botones cuando YouTube esté listo
function onPlayerReady(event) {
    btnPlay.addEventListener('click', () => {
        if (player.getPlayerState() === YT.PlayerState.PLAYING) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    });

    document.getElementById('btn-next').addEventListener('click', () => player.nextVideo());
    document.getElementById('btn-prev').addEventListener('click', () => player.previousVideo());
    document.getElementById('btn-shuffle').addEventListener('click', () => {
        player.setShuffle(true);
        player.nextVideo();
    });

    actualizarInterfaz();
}

// 4. Detectar cuando cambia la canción o se pausa
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        iconPlay.classList.remove('fa-play');
        iconPlay.classList.add('fa-pause');
        actualizarInterfaz();
    } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.UNSTARTED) {
        iconPlay.classList.remove('fa-pause');
        iconPlay.classList.add('fa-play');
    }
}

// 5. La magia visual: Actualizar textos, colores y carátula
function actualizarInterfaz() {
    const videoData = player.getVideoData();
    if (!videoData || !videoData.video_id) return;

    const videoId = videoData.video_id;
    const title = videoData.title;

    // Actualizar título
    songTitle.innerText = title;

    // Buscar y mostrar la letra
    if (lyricsData[videoId]) {
        lyricsContent.innerText = lyricsData[videoId];
    } else {
        lyricsContent.innerText = "❤️ Disfruta la canción ❤️\n(Letra no disponible)";
    }

    // Actualizar carátula y extraer colores
    // Usamos mqdefault.jpg porque es la que menos bloqueos de seguridad tiene
    const imgUrl = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;

    // Creamos una imagen temporal para extraer el color sin romper la seguridad del navegador (CORS)
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imgUrl;

    img.onload = function() {
        albumArt.src = img.src;
        try {
            // Extraemos la paleta dominante
            const color = colorThief.getColor(img);
            const rgbAcento = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
            // Un color más claro para el fondo
            const rgbFondo = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.3)`;

            // Inyectamos los colores a nuestras variables CSS
            document.documentElement.style.setProperty('--accent-color', rgbAcento);
            document.documentElement.style.setProperty('--bg-color', rgbFondo);
            document.documentElement.style.setProperty('--bg-gradient', rgbAcento);
        } catch (e) {
            console.log("El navegador bloqueó la extracción de color por seguridad.");
        }
    };
}
