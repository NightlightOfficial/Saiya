class Saiya {

    // URL of the video
    videoSrc;

    // What type of player to use (0 - normal / 1 - collapsed)
    type = 0;

    // How many times the video has attempted to fix itself
    refreshAttempts = 0;

    // The structure of the HTML element of the Video Player
    element = {
        locationNode: null,
        parent: null,
        video: null,
        audio: null,
        controls: {
            play: null,
            loop: null,
            maximize: null,
            mute: null
        }
    }

    isReadyToPlay = false;

    // Choose what the maximize button does, by default (null) opens the video in browser fullscreen
    fullscreenHandler = null;

    /**
     * Initializes the Video Player class with the video source URL specified
     * @param {string} videoSrc 
     */
    constructor(videoSrc) {
        this.videoSrc = videoSrc;
    }

    /**
     * Starts the playback of the Video Player
     */
    play() {
        if (this.element.parent == null) {
            console.warn("Too many refresh attempts, ignoring.");
            return;
        }
        if (!this.element.video.paused) {
            this.pause();
            return;
        }
        this.element.video.play();
        this.element.controls.maximize.style.animation = "none";
        this.element.controls.loop.style.animation = "none";
        setTimeout(() => {
            this.element.controls.maximize.style.animation = "";
            this.element.controls.loop.style.animation = "";
        }, 50);
        this.element.parent.classList.remove("visible");
        this.element.parent.classList.remove("paused");
    }

    /**
     * Pauses the playback of the Video Player
     */
    pause() {
        if (this.element.parent == null) {
            throw new Error("Video Player hasn't been created yet.");
        }
        this.element.video.pause();
        this.element.parent.classList.remove("paused");
        this.element.parent.classList.add("paused");
    }

    /**
     * Attempts to fix locally cached video by forcing the browser to fetch a fresh source
     */
    refresh() {
        if (this.element.parent == null) {
            throw new Error("Video Player hasn't been created yet.");
        }
        if (this.refreshAttempts >= 3) {
            console.warn("Too many refresh attempts, ignoring.");
            return;
        }
        this.refreshAttempts++;
        this.element.video.src = this.videoSrc + "?reload=" + this.refreshAttempts;
    }

    /**
     * Maximizes the video using the default browser method or a custom handler by setting the fullscreenHandler property to a function
     */
    maximize() {
        if (this.element.parent == null) {
            throw new Error("Video Player hasn't been created yet.");
        }
        if (this.fullscreenHandler == null) {
            /*
            legacy
            if (this.element.video.requestFullscreen) {
                this.element.video.requestFullscreen();
            } else if (this.element.video.webkitRequestFullscreen) {
                this.element.video.webkitRequestFullscreen();
            }*/

            this.element.locationNode = this.element.parent.parentNode;

            //reappend video player and fullscreen - destroy on exit
            let maximizedVideoPlayer = document.createElement('div');
            maximizedVideoPlayer.style.display = "block";
            maximizedVideoPlayer.style.width = "100vw";
            maximizedVideoPlayer.style.height = "100vh";
            maximizedVideoPlayer.style.zIndex = "1000";
            maximizedVideoPlayer.style.position = "fixed";

            maximizedVideoPlayer.appendChild(this.element.parent);
            this.fullscreenHandler = function () {
                this.element.parent.classList.remove('fullscreen');
                this.element.locationNode.appendChild(this.element.parent);
                maximizedVideoPlayer.remove();
                this.fullscreenHandler = null;
            }
            this.element.parent.classList.add('fullscreen');
            document.body.prepend(maximizedVideoPlayer);
        } else {
            this.fullscreenHandler();
        }
    }

    /**
     * Mutes the video. This automatically affects the audio bar as well.
     */
    mute() {
        if (this.element.parent == null) {
            throw new Error("Video Player hasn't been created yet.");
        }

        // Video volume doesnt match the audio bar input = muted
        if (this.element.video.volume == 0 && this.element.audio.value > 0) {
            console.log('muted');
            this.element.video.volume = parseFloat(this.element.audio.value);
            this.element.controls.mute.classList.remove('muted');
        } else {
            console.log('unmuted');
            this.element.video.volume = 0;
            this.element.controls.mute.classList.add('muted');
        }
    }

    /**
     * Create a video player element with the specified source
     * @returns {HTMLElement}
     */
    create() {
        let mainElement = document.createElement('div');
        mainElement.className = 'saiya paused visible';

        //note: 'visible' class is removed after playing the video for the first time, 
        // to avoid confusing video with an image

        // Cover screen is used to add effects on top of the video (like when paused, darken)
        let coverScreen = document.createElement('div');
        coverScreen.className = 'coverScreen';
        coverScreen.addEventListener('click', () => {
            if (getComputedStyle(mainElement).getPropertyValue('--isMobile') == 1) {
                if (this.element.video.paused) {
                    this.element.parent.classList.toggle('hidden');
                } else {
                    this.element.parent.classList.toggle('visible');
                }
            }
        });

        mainElement.appendChild(coverScreen);

        // controls
        let playBtn = document.createElement('a');
        playBtn.className = 'control playBtn';
        playBtn.innerHTML = `<svg class="pausedIcon" width="39" height="42" viewBox="0 0 39 42" fill: var(--Gradient-Gradient-TL, linear-gradient(159deg, #B51BE4 0%, #8118E7 100%)); xmlns="http://www.w3.org/2000/svg">
        <path d="M35.7334 15.4404C40.0889 17.8636 40.0889 24.1364 35.7334 26.5596L9.43516 41.1905C5.2021 43.5456 -2.1167e-07 40.4803 0 35.6309L1.27726e-06 6.36908C1.48893e-06 1.51973 5.20209 -1.54555 9.43515 0.809499L35.7334 15.4404Z" fill="url(#paint0_linear_294_82)"/>
        <defs>
            <linearGradient id="paint0_linear_294_82" x1="0" y1="0" x2="20.4865" y2="49.6405" gradientUnits="userSpaceOnUse">
                <stop stop-color="var(--Primary-Primary-500)"/>
                <stop offset="1" stop-color="var(--Secondary-Secondary-500)"/>
            </linearGradient>
        </defs>
        </svg>
        <svg class="playingIcon" width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.33334 10C3.33334 6.85731 3.33334 5.28596 4.30965 4.30965C5.28596 3.33334 6.85731 3.33334 10 3.33334C13.1427 3.33334 14.714 3.33334 15.6904 4.30965C16.6667 5.28596 16.6667 6.85731 16.6667 10V30C16.6667 33.1427 16.6667 34.7141 15.6904 35.6904C14.714 36.6667 13.1427 36.6667 10 36.6667C6.85731 36.6667 5.28596 36.6667 4.30965 35.6904C3.33334 34.7141 3.33334 33.1427 3.33334 30V10Z" stroke="var(--Neutral-Neutral-800)" stroke-width="1.5"/>
            <path d="M23.3333 10C23.3333 6.85731 23.3333 5.28596 24.3096 4.30965C25.286 3.33334 26.8573 3.33334 30 3.33334C33.1427 3.33334 34.714 3.33334 35.6904 4.30965C36.6667 5.28596 36.6667 6.85731 36.6667 10V30C36.6667 33.1427 36.6667 34.7141 35.6904 35.6904C34.714 36.6667 33.1427 36.6667 30 36.6667C26.8573 36.6667 25.286 36.6667 24.3096 35.6904C23.3333 34.7141 23.3333 33.1427 23.3333 30V10Z" stroke="var(--Neutral-Neutral-800)" stroke-width="1.5"/>
        </svg>`;
        playBtn.addEventListener('click', () => {
            this.play();
        });
        this.element.controls.play = playBtn;


        let loopBtn = document.createElement('a');
        loopBtn.className = 'control loopBtn';
        loopBtn.innerHTML = `<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.98646 12.2778H3.23646V12.2778H3.98646ZM3.98646 14.0833L3.45822 14.6157C3.75063 14.9059 4.2223 14.9059 4.51471 14.6157L3.98646 14.0833ZM6.3345 12.8102C6.62854 12.5184 6.63041 12.0436 6.33867 11.7495C6.04693 11.4555 5.57206 11.4536 5.27802 11.7454L5.80626 12.2778L6.3345 12.8102ZM2.69491 11.7454C2.40087 11.4536 1.926 11.4555 1.63426 11.7495C1.34252 12.0436 1.34438 12.5184 1.63842 12.8102L2.16667 12.2778L2.69491 11.7454ZM20.2201 7.97612C20.437 8.32899 20.8989 8.43918 21.2518 8.22225C21.6047 8.00532 21.7149 7.54341 21.4979 7.19054L20.859 7.58333L20.2201 7.97612ZM13.0854 3.25V2.5C7.65157 2.5 3.23646 6.87212 3.23646 12.2778H3.98646H4.73646C4.73646 7.71163 8.46886 4 13.0854 4V3.25ZM3.98646 12.2778H3.23646L3.23646 14.0833L3.98646 14.0833H4.73646L4.73646 12.2778H3.98646ZM3.98646 14.0833L4.51471 14.6157L6.3345 12.8102L5.80626 12.2778L5.27802 11.7454L3.45822 13.5509L3.98646 14.0833ZM3.98646 14.0833L4.51471 13.5509L2.69491 11.7454L2.16667 12.2778L1.63842 12.8102L3.45822 14.6157L3.98646 14.0833ZM20.859 7.58333L21.4979 7.19054C19.7687 4.37772 16.6471 2.5 13.0854 2.5V3.25V4C16.1082 4 18.7543 5.59189 20.2201 7.97612L20.859 7.58333Z" fill="var(--Neutral-Neutral-800)"/>
            <path d="M22.0067 11.9167L22.534 11.3832C22.2418 11.0945 21.7717 11.0945 21.4795 11.3832L22.0067 11.9167ZM19.6527 13.1888C19.3581 13.48 19.3554 13.9548 19.6466 14.2494C19.9377 14.544 20.4126 14.5468 20.7072 14.2556L20.18 13.7222L19.6527 13.1888ZM23.3063 14.2556C23.6008 14.5468 24.0757 14.544 24.3669 14.2494C24.6581 13.9548 24.6553 13.48 24.3607 13.1888L23.8335 13.7222L23.3063 14.2556ZM5.70791 18.0228C5.49038 17.6703 5.02828 17.5609 4.67578 17.7784C4.32329 17.9959 4.21388 18.458 4.43141 18.8105L5.06966 18.4167L5.70791 18.0228ZM12.873 22.75V23.5C18.3233 23.5 22.7567 19.1306 22.7567 13.7222H22.0067H21.2567C21.2567 18.2857 17.5115 22 12.873 22V22.75ZM22.0067 13.7222H22.7567V11.9167H22.0067H21.2567V13.7222H22.0067ZM22.0067 11.9167L21.4795 11.3832L19.6527 13.1888L20.18 13.7222L20.7072 14.2556L22.534 12.4501L22.0067 11.9167ZM22.0067 11.9167L21.4795 12.4501L23.3063 14.2556L23.8335 13.7222L24.3607 13.1888L22.534 11.3832L22.0067 11.9167ZM5.06966 18.4167L4.43141 18.8105C6.16738 21.6235 9.30005 23.5 12.873 23.5V22.75V22C9.83625 22 7.17917 20.4068 5.70791 18.0228L5.06966 18.4167Z" fill="var(--Neutral-Neutral-800)"/>
        </svg>`;

        loopBtn.addEventListener('click', () => {
            if (videoElement.loop) {
                videoElement.loop = false;
                this.element.controls.loop.classList.remove('active');
            } else {
                videoElement.loop = true;
                this.element.controls.loop.classList.add('active');
            }
        });

        this.element.controls.loop = loopBtn;

        let maximizeBtn = document.createElement('a');
        maximizeBtn.className = 'control maxBtn';
        maximizeBtn.innerHTML = `<svg class="maximizeIcon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_294_79)">
            <path d="M7.5 12.5L1.66667 18.3333M1.66667 18.3333H6.54762M1.66667 18.3333V13.4524" stroke="var(--Neutral-Neutral-800)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12.5 7.49999L18.3333 1.66666M18.3333 1.66666H13.4524M18.3333 1.66666V6.54761" stroke="var(--Neutral-Neutral-800)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
        <defs>
            <clipPath id="clip0_294_79">
            <rect width="20" height="20" rx="5" fill="white"/>
            < /clipPath>
                </defs>
        </svg>
        <svg class="minimizeIcon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 22L9 15M9 15H3.14286M9 15V20.8571" stroke="var(--Neutral-Neutral-800)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M22 2L15 9M15 9H20.8571M15 9V3.14286" stroke="var(--Neutral-Neutral-800)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;

        maximizeBtn.addEventListener('click', () => {
            this.maximize();
        });

        this.element.controls.maximize = maximizeBtn;

        let controlsContainer = document.createElement('div');
        controlsContainer.className = 'controlsContainer';

        let progressBarWrapper = document.createElement('div');
        progressBarWrapper.className = 'progressBarWrapper';

        let progressBarInput = document.createElement('input');
        progressBarInput.type = 'range';
        progressBarInput.min = "0";
        progressBarInput.max = "1";
        progressBarInput.step = "0.01";

        let progressBar = document.createElement('div');
        progressBar.className = 'progressBar';

        let innerProgressBar = document.createElement('div');
        innerProgressBar.className = 'inner';

        let videoElement = document.createElement('video');
        videoElement.src = this.videoSrc;
        videoElement.playsInline = true;
        videoElement.addEventListener('canplay', () => {
            progressBarInput.max = videoElement.duration;
            this.isReadyToPlay = true;
        });
        videoElement.addEventListener('timeupdate', () => {
            if (!this.isReadyToPlay) return;
            progressBarInput.value = videoElement.currentTime;
            let percentageDone = videoElement.currentTime / videoElement.duration * 100;
            innerProgressBar.style.width = percentageDone + "%";

            if (videoElement.currentTime == videoElement.duration) {
                this.pause();
            }
        });
        progressBarInput.addEventListener('input', () => {
            if (!this.isReadyToPlay) return;
            let percentageDone = progressBarInput.value / videoElement.duration * 100;
            innerProgressBar.style.width = percentageDone + "%";
            videoElement.currentTime = progressBarInput.value;
        });


        this.element.video = videoElement;

        let sideBarWrapper = document.createElement('div');
        sideBarWrapper.className = 'sideBarWrapper';
        if (this.type == 1) sideBarWrapper.classList.add('collapsed');

        let muteBtn = document.createElement('a');
        muteBtn.className = 'control';
        muteBtn.innerHTML = `<svg class='volumeIcon' width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.15109 8.22854C1.20635 7.32191 1.23398 6.8686 1.46891 6.43259C1.68355 6.03422 2.09423 5.64781 2.50491 5.45781C2.95441 5.24984 3.46963 5.24984 4.50006 5.24984C4.88412 5.24984 5.07614 5.24984 5.26215 5.21843C5.44604 5.18738 5.62535 5.13358 5.79596 5.05829C5.96854 4.98212 6.12886 4.87642 6.44949 4.66501L6.61369 4.55675C8.52092 3.29923 9.47454 2.67048 10.275 2.94365C10.4285 2.99603 10.5771 3.07163 10.7098 3.16488C11.4018 3.65122 11.4544 4.78275 11.5595 7.0458C11.5985 7.88375 11.625 8.60093 11.625 8.99984C11.625 9.39875 11.5985 10.1159 11.5595 10.9539C11.4544 13.2169 11.4018 14.3485 10.7098 14.8348C10.5771 14.9281 10.4285 15.0037 10.275 15.056C9.47454 15.3292 8.52092 14.7004 6.61369 13.4429L6.44949 13.3347C6.12886 13.1233 5.96854 13.0176 5.79596 12.9414C5.62535 12.8661 5.44604 12.8123 5.26215 12.7813C5.07614 12.7498 4.88412 12.7498 4.50006 12.7498C3.46963 12.7498 2.95441 12.7498 2.50491 12.5419C2.09423 12.3519 1.68355 11.9655 1.46891 11.5671C1.23398 11.1311 1.20635 10.6778 1.15109 9.77114C1.13474 9.50293 1.125 9.24164 1.125 8.99984C1.125 8.75804 1.13474 8.49675 1.15109 8.22854Z" stroke="var(--Neutral-Neutral-800)" stroke-width="1.5"/>
            <path d="M15 4.5C15 4.5 16.125 5.85 16.125 9C16.125 12.15 15 13.5 15 13.5" stroke="var(--Neutral-Neutral-800)" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M13.5 6.75C13.5 6.75 13.875 7.425 13.875 9C13.875 10.575 13.5 11.25 13.5 11.25" stroke="var(--Neutral-Neutral-800)" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <svg class='muteIcon' width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.355 5.17021C14.2342 4.48272 14.036 4.03679 13.6725 3.76704C13.531 3.662 13.3725 3.57683 13.2087 3.51782C12.3547 3.21008 11.3373 3.9184 9.30255 5.33506L9.12737 5.45702C8.7853 5.69518 8.61426 5.81426 8.43014 5.90007C8.24812 5.98489 8.05682 6.04549 7.86064 6.08047C7.66219 6.11586 7.45732 6.11586 7.04759 6.11586C5.94825 6.11586 5.39858 6.11586 4.91902 6.35014C4.48088 6.5642 4.04273 6.99951 3.81374 7.44829C3.56311 7.93948 3.53363 8.45016 3.47468 9.47152C3.45723 9.77367 3.44684 10.068 3.44684 10.3404C3.44684 10.6128 3.45723 10.9072 3.47468 11.2093C3.53363 12.2307 3.56311 12.7414 3.81374 13.2326C4.04273 13.6813 4.48088 14.1167 4.91902 14.3307C5.39858 14.565 5.94825 14.565 7.04759 14.565C7.45732 14.565 7.66219 14.565 7.86064 14.6004C8.05682 14.6354 8.24812 14.696 8.43014 14.7808C8.61426 14.8666 8.7853 14.9857 9.12737 15.2238L9.30255 15.3458C11.3373 16.7624 12.3547 17.4708 13.2087 17.163C13.3725 17.104 13.531 17.0189 13.6725 16.9138C14.036 16.6441 14.2342 16.1981 14.355 15.5106" stroke="var(--Neutral-Neutral-800)" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M17.234 7.75535L12.0638 12.9255M12.0638 7.75533L17.234 12.9255" stroke="var(--Neutral-Neutral-800)" stroke-width="1.5" stroke-linecap="round"/>
        </svg>`;

        muteBtn.addEventListener('click', () => {
            this.mute();
        });

        this.element.controls.mute = muteBtn;

        let audioBarWrapper = document.createElement('div');
        audioBarWrapper.className = 'audioBarWrapper';

        let audioBarInput = document.createElement('input');
        audioBarInput.type = 'range';
        audioBarInput.min = "0";
        audioBarInput.max = "1";
        audioBarInput.step = "0.01";

        this.element.audio = audioBarInput;

        audioBarInput.addEventListener('input', () => {
            let volumeAdj = parseFloat(audioBarInput.value) * 100;
            audioBarInner.style.height = volumeAdj + "%";
            this.element.video.volume = parseFloat(audioBarInput.value);
            this.element.controls.mute.classList.remove('muted');
        });

        let audioBar = document.createElement('div');
        audioBar.className = 'audioBar';

        let audioBarInner = document.createElement('div');
        audioBarInner.className = 'inner';

        audioBar.appendChild(audioBarInner);
        audioBarWrapper.appendChild(audioBar);
        audioBarWrapper.appendChild(audioBarInput);

        sideBarWrapper.appendChild(muteBtn);
        sideBarWrapper.appendChild(audioBarWrapper);

        mainElement.appendChild(videoElement);

        controlsContainer.appendChild(loopBtn);
        controlsContainer.appendChild(playBtn);
        controlsContainer.appendChild(maximizeBtn);

        progressBarWrapper.appendChild(progressBar);
        progressBar.appendChild(progressBarInput);
        progressBar.appendChild(innerProgressBar);

        mainElement.appendChild(progressBarWrapper);

        mainElement.appendChild(controlsContainer);

        mainElement.appendChild(sideBarWrapper);

        audioBarInput.dispatchEvent(new Event('input'));

        this.element.parent = mainElement;

        return mainElement;
    }

    /**
     * Set the type of video player to use (0 - normal / 1 - collapsed)
     * @param {int} type 
     */
    setType(type) {
        this.type = type;
    }
}