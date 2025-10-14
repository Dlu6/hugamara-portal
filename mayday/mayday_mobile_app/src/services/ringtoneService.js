import { Audio } from "expo-av";

// Singleton state for ringtone management
const state = {
  sound: null,
  isPlaying: false,
  isLoaded: false,
};

/**
 * Load the ringtone audio file
 * This should be called once during app initialization
 */
export async function loadRingtone() {
  try {
    if (state.isLoaded && state.sound) {
      console.log("[Ringtone] Ringtone already loaded, skipping");
      return true;
    }

    console.log("[Ringtone] Loading ringtone...");
    console.log(
      "[Ringtone] About to call Audio.Sound.createAsync with require()"
    );

    // Try different approaches for loading the audio file
    let audioSource;

    // Method 1: Try require() first
    try {
      audioSource = require("../assets/sounds/promise.mp3");
      console.log("[Ringtone] require() result:", audioSource);
      console.log("[Ringtone] require() type:", typeof audioSource);
      console.log("[Ringtone] require() keys:", Object.keys(audioSource || {}));
    } catch (requireError) {
      console.log("[Ringtone] require() failed:", requireError.message);
      // Method 2: Try using a data URI approach
      console.log("[Ringtone] Trying data URI approach...");
      audioSource = {
        uri: "file://" + require("../assets/sounds/promise.mp3"),
      };
      console.log("[Ringtone] Data URI source:", audioSource);
    }

    // Use the same ringtone MP3 file as the electron app
    console.log("[Ringtone] Calling Audio.Sound.createAsync...");
    const { sound } = await Audio.Sound.createAsync(audioSource, {
      shouldPlay: false,
      isLooping: true,
      volume: 0.8,
    });

    console.log("[Ringtone] Audio.Sound.createAsync completed successfully");
    console.log("[Ringtone] Sound object:", sound);
    console.log("[Ringtone] Sound status:", await sound.getStatusAsync());

    state.sound = sound;
    state.isLoaded = true;

    console.log("[Ringtone] Ringtone loaded successfully");
    return true;
  } catch (error) {
    console.error("[Ringtone] Failed to load ringtone:", error);
    console.error("[Ringtone] Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    });
    // Fallback: just return true and skip ringtone
    state.isLoaded = true;
    return true;
  }
}

/**
 * Play the ringtone continuously
 */
export async function playRingtone() {
  try {
    console.log("[Ringtone] playRingtone() called");
    console.log("[Ringtone] Current state:", {
      isLoaded: state.isLoaded,
      isPlaying: state.isPlaying,
      hasSound: !!state.sound,
    });

    if (!state.isLoaded) {
      console.log("[Ringtone] Not loaded, calling loadRingtone()");
      const loaded = await loadRingtone();
      if (!loaded) {
        console.error("[Ringtone] Cannot play ringtone - failed to load");
        return false;
      }
    }

    if (state.isPlaying) {
      console.log("[Ringtone] Ringtone is already playing");
      return true;
    }

    console.log("[Ringtone] Starting ringtone playback...");

    if (state.sound) {
      console.log("[Ringtone] Setting up sound for playback...");
      await state.sound.setIsLoopingAsync(true);
      console.log("[Ringtone] Calling playAsync()...");
      const playResult = await state.sound.playAsync();
      console.log("[Ringtone] Play result:", playResult);
      state.isPlaying = true;
      console.log("[Ringtone] Ringtone playback started successfully");
    } else {
      console.log("[Ringtone] No sound object available, skipping playback");
    }

    return true;
  } catch (error) {
    console.error("[Ringtone] Failed to play ringtone:", error);
    console.error("[Ringtone] Play error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    return false;
  }
}

/**
 * Stop the ringtone
 */
export async function stopRingtone() {
  try {
    if (!state.isPlaying || !state.sound) {
      console.log("[Ringtone] Ringtone is not playing");
      return true;
    }

    console.log("[Ringtone] Stopping ringtone...");
    await state.sound.stopAsync();
    state.isPlaying = false;

    return true;
  } catch (error) {
    console.error("[Ringtone] Failed to stop ringtone:", error);
    return false;
  }
}

/**
 * Check if ringtone is currently playing
 */
export function isRingtonePlaying() {
  return state.isPlaying;
}

/**
 * Unload the ringtone to free up memory
 */
export async function unloadRingtone() {
  try {
    if (state.sound) {
      await stopRingtone();
      await state.sound.unloadAsync();
      state.sound = null;
      state.isLoaded = false;
      state.isPlaying = false;
      console.log("[Ringtone] Ringtone unloaded");
    }
  } catch (error) {
    console.error("[Ringtone] Failed to unload ringtone:", error);
  }
}

/**
 * Set ringtone volume (0.0 to 1.0)
 */
export async function setRingtoneVolume(volume) {
  try {
    if (state.sound) {
      await state.sound.setVolumeAsync(Math.max(0, Math.min(1, volume)));
    }
  } catch (error) {
    console.error("[Ringtone] Failed to set volume:", error);
  }
}
