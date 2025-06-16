import { createSignal, createEffect } from "solid-js";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";

/**
 * useHeader - Hook pour la logique du header
 * Gère l'état always on top et autres fonctionnalités
 */
export function useHeader() {
  const [isAlwaysOnTop, setIsAlwaysOnTop] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);

  // Check initial always on top state
  createEffect(async () => {
    try {
      const currentWindow = getCurrentWindow();
      const label = currentWindow.label;
      const alwaysOnTop = await invoke<boolean>("is_always_on_top", { window: label });
      setIsAlwaysOnTop(alwaysOnTop);
    } catch (error) {
      console.error("Failed to check always on top state:", error);
    }
  });

  const toggleAlwaysOnTop = async () => {
    try {
      setIsLoading(true);
      const currentWindow = getCurrentWindow();
      const label = currentWindow.label;
      const newState = await invoke<boolean>("toggle_always_on_top", { window: label });
      setIsAlwaysOnTop(newState);
    } catch (error) {
      console.error("Failed to toggle always on top:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createFloatingWindow = async () => {
    try {
      const timestamp = Date.now();
      const label = `floating-${timestamp}`;
      await invoke("create_floating_window", {
        label,
        width: 400,
        height: 500,
      });
    } catch (error) {
      console.error("Failed to create floating window:", error);
    }
  };

  const hideToMenuBar = async () => {
    try {
      await invoke("show_in_menu_bar");
    } catch (error) {
      console.error("Failed to hide to menu bar:", error);
    }
  };

  return {
    isAlwaysOnTop,
    isLoading,
    toggleAlwaysOnTop,
    createFloatingWindow,
    hideToMenuBar,
  };
}