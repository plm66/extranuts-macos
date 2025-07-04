import {
  Component,
  createSignal,
  onMount,
  For,
  Show,
  createEffect,
} from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { TauriEvent } from "@tauri-apps/api/event";
import { Icon } from "@iconify-icon/solid";
import {
  notes,
  selectedNote,
  setSelectedNote,
  createNote,
  updateNote,
  deleteNote,
  togglePinNote,
  filteredNotes,
  loadNotes,
  isLoading,
  error,
  assignSelectorToNote,
} from "./stores/noteStore";
import {
  preferences,
  loadPreferences,
  toggleDeleteConfirmation,
} from "./stores/preferencesStore";
import { createFullBackup } from "./utils/backup";
import {
  parseWikiLinks,
  getAutoCompleteMatches,
  findWikiLinkAtCursor,
} from "./utils/wikilinks";
import SettingsPanel from "./components/SettingsPanel";
import ExportModal from "./components/ExportModal";
import CategorySelector from "./components/CategorySelector";
import CategoryManager from "./components/CategoryManager";
import { categoriesService } from "./services/categories";
import MarkdownPreview from "./components/MarkdownPreview";
import EnhancedEditor from "./components/EnhancedEditor";
import ThemeToggle from "./components/ThemeToggle";
import { themeStore } from "./stores/themeStore";
import { selectorsStore } from "./stores/selectorsStore";
import SelectorGrid from "./components/SelectorGrid";
import NoteSelectorColumn from "./components/NoteSelectorColumn";
import ResizeHandle from "./components/ResizeHandle";
import { useLoadSelectors } from "./hooks/useLoadSelectors";

// Import du debug des sélecteurs (à retirer en production)
import "./debugSelectors";
import "./testSelectors";
import "./testRefreshAuto";

// WikiLink Renderer Component
const WikiLinkRenderer: Component<{
  content: string;
  noteList: Array<{ title: string; id: string }>;
  onLinkClick: (noteTitle: string, exists: boolean) => void;
}> = (props) => {
  const renderContent = () => {
    const parsed = parseWikiLinks(props.content, props.noteList);

    if (parsed.links.length === 0) {
      return (
        <pre class="whitespace-pre-wrap font-sans text-macos-text">
          {props.content}
        </pre>
      );
    }

    const elements: any[] = [];
    let lastIndex = 0;

    parsed.links.forEach((link, i) => {
      // Add text before the link
      if (link.startIndex > lastIndex) {
        const textBefore = props.content.slice(lastIndex, link.startIndex);
        elements.push(<span key={`text-${i}`}>{textBefore}</span>);
      }

      // Add the clickable link
      const displayText = link.displayText || link.noteTitle;
      const className = link.exists ? "wikilink-exists" : "wikilink-missing";

      elements.push(
        <span
          key={`link-${i}`}
          class={className}
          onClick={() => props.onLinkClick(link.noteTitle, link.exists)}
        >
          {displayText}
        </span>
      );

      lastIndex = link.endIndex;
    });

    // Add remaining text after the last link
    if (lastIndex < props.content.length) {
      const textAfter = props.content.slice(lastIndex);
      elements.push(<span key="text-end">{textAfter}</span>);
    }

    return (
      <pre class="whitespace-pre-wrap font-sans text-macos-text">
        {elements}
      </pre>
    );
  };

  return <div>{renderContent()}</div>;
};

const App: Component = () => {
  const [isAlwaysOnTop, setIsAlwaysOnTop] = createSignal(false);
  const [noteTitle, setNoteTitle] = createSignal("");
  const [noteContent, setNoteContent] = createSignal("");
  const [editorHeight, setEditorHeight] = createSignal(60); // percentage
  const [currentTime, setCurrentTime] = createSignal(new Date());
  const [lastSaved, setLastSaved] = createSignal<Date | null>(null);
  const [showAutoComplete, setShowAutoComplete] = createSignal(false);
  const [autoCompleteResults, setAutoCompleteResults] = createSignal<
    Array<{ title: string; id: string }>
  >([]);
  const [autoCompletePosition, setAutoCompletePosition] = createSignal({
    top: 0,
    left: 0,
  });
  const [showPreview, setShowPreview] = createSignal(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = createSignal(false);
  const [noteToDelete, setNoteToDelete] = createSignal<string | null>(null);
  const [showSettings, setShowSettings] = createSignal(false);
  const [showExportModal, setShowExportModal] = createSignal(false);
  const [availableCategories, setAvailableCategories] = createSignal<
    Array<{ id: number; name: string; color: string }>
  >([]);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [showCategoryManager, setShowCategoryManager] = createSignal(false);
  const [titleColumnWidth, setTitleColumnWidth] = createSignal(200); // pixels
  const [isRenamingSelector, setIsRenamingSelector] = createSignal(false);
  const [renameValue, setRenameValue] = createSignal("");

  // Charger les sélecteurs personnalisés depuis le backend
  useLoadSelectors();

  // DAVE DEBUG: Effet pour surveiller les changements du signal notes
  createEffect(() => {
    console.log('🔥 DAVE DEBUG: Signal notes() a changé!');
    console.log('🔥 DAVE DEBUG: Nombre de notes:', notes().length);
    console.log('🔥 DAVE DEBUG: Liste des notes:', notes().map(n => ({ id: n.id, title: n.title })));
  });

  onMount(async () => {
    console.log("App mounted, starting initialization...");

    // Global keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+, for settings
      if (e.metaKey && e.key === ",") {
        e.preventDefault();
        setShowSettings(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    try {
      console.log("Step 1: Getting current window...");
      const currentWindow = getCurrentWindow();
      console.log("Got current window:", currentWindow);

      // Load preferences
      console.log("Loading preferences...");
      await loadPreferences();

      // Check if we need to migrate notes from localStorage
      const { migrateNotesFromLocalStorage, isMigrationComplete } =
        await import("./utils/migrateFromLocalStorage");
      if (!isMigrationComplete()) {
        console.log("Migrating notes from localStorage...");
        try {
          const migratedCount = await migrateNotesFromLocalStorage();
          console.log(`Migrated ${migratedCount} notes from localStorage`);
        } catch (migrationError) {
          console.error("Migration failed:", migrationError);
        }
      }

      // Load notes from database
      console.log("Step 2: Loading notes from database...");
      try {
        await loadNotes();
        console.log("Notes loaded successfully:", notes().length);
      } catch (loadError) {
        console.error("Failed to load notes:", loadError);
        console.error("Error details:", JSON.stringify(loadError, null, 2));
      }

      // Load categories
      try {
        const cats = await categoriesService.getHierarchicalCategories();
        const flatCategories = [];
        const flattenCategories = (categories) => {
          categories.forEach((cat) => {
            if (cat.id) {
              flatCategories.push({
                id: cat.id,
                name: cat.name,
                color: cat.color,
              });
            }
            if (cat.subcategories) {
              flattenCategories(cat.subcategories);
            }
          });
        };
        flattenCategories(cats);
        setAvailableCategories(flatCategories);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }

      // Listen for window events
      console.log("Step 3: Setting up window event listeners...");
      try {
        await currentWindow.listen(TauriEvent.WINDOW_FOCUS, () => {
          console.log("Window focused");
        });
        console.log("Window event listeners set up");
      } catch (eventError) {
        console.error("Failed to set up window events:", eventError);
      }

      // Check if window is always on top
      console.log("Step 4: Checking window always on top status...");
      try {
        const alwaysOnTop = await currentWindow.isAlwaysOnTop();
        setIsAlwaysOnTop(alwaysOnTop);
        console.log("Always on top status:", alwaysOnTop);
      } catch (topError) {
        console.error("Failed to check always on top:", topError);
      }

      // Update current time every second
      console.log("Step 5: Setting up time interval...");
      const timeInterval = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);

      console.log("App initialization completed");
      return () => {
        clearInterval(timeInterval);
        document.removeEventListener("keydown", handleKeyDown);
      };
    } catch (err) {
      console.error("CRITICAL: Error during app initialization:", err);
      console.error("Error stack:", err.stack);
    }
  });

  // Remove old auto-save functionality since we're using the database

  const createFloatingNote = async () => {
    try {
      const note = await createNote("New Floating Note");
      if (!note) return;

      updateNote(note.id, { isFloating: true });

      await invoke("create_floating_window", {
        label: `note-${note.id}`,
        width: 400,
        height: 300,
      });

      setSelectedNote(note);
    } catch (error) {
      console.error("Failed to create floating window:", error);
    }
  };

  const createRegularNote = async () => {
    console.log('🚀 DAVE DEBUG: createRegularNote appelée');
    console.log('🚀 DAVE DEBUG: Notes AVANT création:', notes().length);
    
    const note = await createNote("New Note");
    if (!note) {
      console.log('❌ DAVE DEBUG: createNote a retourné null');
      return;
    }
    
    console.log('✅ DAVE DEBUG: Note créée:', { id: note.id, title: note.title });
    console.log('🚀 DAVE DEBUG: Notes APRÈS création:', notes().length);
    console.log('🚀 DAVE DEBUG: Toutes les notes:', notes().map(n => ({ id: n.id, title: n.title })));

    setSelectedNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    // Focus title field after creating note
    setTimeout(() => {
      const titleInput = document.querySelector(
        'input[placeholder="Note title..."]'
      ) as HTMLInputElement;
      if (titleInput) {
        titleInput.focus();
        titleInput.select(); // Select all text so user can immediately type
      }
    }, 100);
  };

  const saveCurrentNote = () => {
    const note = selectedNote();
    if (note) {
      updateNote(note.id, {
        title: noteTitle() || "Untitled Note",
        content: noteContent(),
      });
      setLastSaved(new Date());
    }
  };

  const toggleAlwaysOnTop = async () => {
    try {
      await invoke("toggle_always_on_top", { window: getCurrentWindow() });
      setIsAlwaysOnTop(!isAlwaysOnTop());
    } catch (error) {
      console.error("Failed to toggle always on top:", error);
    }
  };

  const hideToMenuBar = async () => {
    try {
      await invoke("show_in_menu_bar");
    } catch (error) {
      console.error("Failed to hide to menu bar:", error);
    }
  };


  const handleTitleColumnResize = (e: MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = titleColumnWidth();

    const handleResize = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const newWidth = Math.max(100, Math.min(400, startWidth + deltaX));
      setTitleColumnWidth(newWidth);
    };

    const handleResizeEnd = () => {
      document.removeEventListener("mousemove", handleResize);
      document.removeEventListener("mouseup", handleResizeEnd);
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };

    document.addEventListener("mousemove", handleResize);
    document.addEventListener("mouseup", handleResizeEnd);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const showVersionHistory = () => {
    const note = selectedNote();
    if (!note) return;

    // Version history will be implemented with backend support
    alert("Version history will be available in a future update.");
  };

  const handleWikiLinkClick = async (noteTitle: string, exists: boolean) => {
    if (exists) {
      // Find and navigate to existing note
      const targetNote = notes().find(
        (note) => note.title.toLowerCase() === noteTitle.toLowerCase()
      );
      if (targetNote) {
        setSelectedNote(targetNote);
        setNoteTitle(targetNote.title);
        setNoteContent(targetNote.content);
      }
    } else {
      // Create new note
      const newNote = await createNote(noteTitle);
      if (newNote) {
        setSelectedNote(newNote);
        setNoteTitle(newNote.title);
        setNoteContent(newNote.content);
      }
    }
  };

  const handleContentInput = (e: InputEvent) => {
    const target = e.target as HTMLTextAreaElement;
    const value = target.value;
    const cursorPos = target.selectionStart || 0;

    setNoteContent(value);

    // Check for wikilink auto-completion
    const wikiLinkInfo = findWikiLinkAtCursor(value, cursorPos);

    if (wikiLinkInfo.isInWikiLink && wikiLinkInfo.linkText !== undefined) {
      // Show auto-complete
      const matches = getAutoCompleteMatches(wikiLinkInfo.linkText, notes());
      setAutoCompleteResults(matches);

      if (matches.length > 0) {
        // Calculate position for auto-complete dropdown
        const rect = target.getBoundingClientRect();
        setAutoCompletePosition({
          top: rect.top + 20,
          left: rect.left + 10,
        });
        setShowAutoComplete(true);
      } else {
        setShowAutoComplete(false);
      }
    } else {
      setShowAutoComplete(false);
    }
  };

  const handleSelectorClick = (noteId: string) => {
    console.log('Selector clicked for note:', noteId);
    // TODO: Implémenter l'ouverture du menu d'assignation
  };

  const handleAssignSelector = (noteId: string, selectorId: number) => {
    if (selectorId === 0) {
      // Supprimer l'assignation
      assignSelectorToNote(noteId, undefined as any);
    } else {
      // Assigner le sélecteur
      assignSelectorToNote(noteId, selectorId);
    }
  };

  const handleSelectorDoubleClick = (selectorId: number) => {
    console.log('🔥 handleSelectorDoubleClick appelé avec selectorId:', selectorId);
    const note = selectedNote();
    console.log('🔥 selectedNote():', note ? { id: note.id, title: note.title } : 'NULL');
    
    if (note) {
      console.log('🔥 Avant assignSelectorToNote - noteId:', note.id, 'selectorId:', selectorId);
      assignSelectorToNote(note.id, selectorId);
      console.log(`🔥 Sélecteur ${selectorId} assigné à la note courante: ${note.title}`);
    } else {
      console.log("🔥 ERREUR: Aucune note sélectionnée pour l'assignation");
    }
  };

  const getCategoryInfo = (categoryId?: string) => {
    if (!categoryId) return null;
    return availableCategories().find(
      (cat) => cat.id.toString() === categoryId
    );
  };

  const formatNoteDate = (dateString: string | Date) => {
    const noteDate = new Date(dateString);
    const today = new Date();

    // Check if the note is from today
    const isToday = noteDate.toDateString() === today.toDateString();

    if (isToday) {
      // Format as "19:16" for today's notes
      return noteDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } else {
      // Format as "Sun Jun 15" for other dates (macOS style)
      return noteDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  };

  const filteredNotesForDisplay = () => {
    console.log('🔍 DAVE DEBUG: filteredNotesForDisplay appelée');
    console.log('🔍 DAVE DEBUG: Notes totales:', notes().length);
    console.log('🔍 DAVE DEBUG: searchQuery:', searchQuery());
    console.log('🔍 DAVE DEBUG: activeSelector:', selectorsStore.activeSelector);
    
    // TEMPORAIRE: Retourner toutes les notes sans filtre pour debug
    const allNotes = notes();
    console.log('🔍 DAVE DEBUG: Retour de toutes les notes:', allNotes.map(n => ({ id: n.id, title: n.title })));
    return allNotes;
    
    /* Code original commenté pour debug
    const query = searchQuery().toLowerCase();
    let result = notes();
    
    // Filtre par searchQuery si présent
    if (query) {
      result = result.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query)
      );
    }
    
    // Filtre par sélecteur actif si présent
    if (selectorsStore.activeSelector) {
      result = result.filter(
        (note) => note.selectorId === selectorsStore.activeSelector.id
      );
    }
    
    return result;
    */
  };

  const insertAutoComplete = (noteTitle: string) => {
    const textarea = document.querySelector(
      'textarea[placeholder*="content"]'
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const value = textarea.value;
    const cursorPos = textarea.selectionStart || 0;
    const wikiLinkInfo = findWikiLinkAtCursor(value, cursorPos);

    if (wikiLinkInfo.isInWikiLink && wikiLinkInfo.startPos !== undefined) {
      const beforeLink = value.slice(0, wikiLinkInfo.startPos);
      const afterCursor = value.slice(cursorPos);
      const newValue = beforeLink + `[[${noteTitle}]]` + afterCursor;

      setNoteContent(newValue);
      setShowAutoComplete(false);

      // Set cursor position after the inserted link
      setTimeout(() => {
        const newCursorPos = beforeLink.length + `[[${noteTitle}]]`.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }, 0);
    }
  };

  const renderContentWithLinks = () => {
    const content = noteContent();
    if (!content.trim()) return content;

    const parsed = parseWikiLinks(content, notes());

    if (parsed.links.length === 0) {
      return content;
    }

    let result = content;
    let offset = 0;

    // Replace links from end to start to maintain correct indices
    parsed.links.reverse().forEach((link) => {
      const displayText = link.displayText || link.noteTitle;
      const className = link.exists ? "wikilink-exists" : "wikilink-missing";

      const beforeLink = result.slice(0, link.startIndex);
      const afterLink = result.slice(link.endIndex);

      result = beforeLink + displayText + afterLink;
    });

    return result;
  };

  const togglePreviewMode = () => {
    setShowPreview(!showPreview());
    saveCurrentNote(); // Save before switching modes
  };

  return (
    <div
      class={`flex flex-col h-screen bg-macos-bg ${themeStore.theme() === "light" ? "theme-light" : ""}`}
    >
      {/* Loading State */}
      <Show when={isLoading()}>
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div class="text-center">
            <Icon
              icon="material-symbols:sync"
              class="w-8 h-8 animate-spin mb-2"
            />
            <p class="text-macos-text">Loading notes...</p>
          </div>
        </div>
      </Show>

      {/* Error State */}
      <Show when={error()}>
        <div class="fixed top-4 right-4 bg-red-500/20 border border-red-500/50 rounded-lg p-4 z-50">
          <p class="text-red-400">{error()}</p>
        </div>
      </Show>
      {/* Top Header */}
      <div class="h-16 sidebar-glass flex items-center justify-between px-6 border-b border-macos-border drag-region">
        <h1 class="text-xl font-semibold">Extranuts</h1>

        <div class="flex items-center space-x-2">
          {/* DAVE DEBUG: Bouton de test */}
          <button
            onClick={() => {
              console.log('🧪 DAVE TEST: Création directe d\'une note');
              console.log('🧪 DAVE TEST: notes() AVANT:', notes().length);
              createNote("Test Note " + Date.now()).then(note => {
                console.log('🧪 DAVE TEST: Note créée:', note);
                console.log('🧪 DAVE TEST: notes() APRÈS:', notes().length);
                console.log('🧪 DAVE TEST: notes() contenu:', notes());
              });
            }}
            class="px-4 py-2 bg-red-500 text-white rounded-lg text-sm no-drag"
          >
            DEBUG TEST
          </button>
          <button
            onClick={createRegularNote}
            class="px-4 py-2 glass-morphism hover-highlight rounded-lg text-sm no-drag"
          >
            + New Note
          </button>
          <button
            onClick={createFloatingNote}
            class="px-4 py-2 glass-morphism hover-highlight rounded-lg text-sm no-drag flex items-center gap-2"
          >
            <Icon icon="material-symbols:dynamic-feed" class="w-4 h-4" />
          </button>
          <button
            onClick={toggleAlwaysOnTop}
            class="px-3 py-1.5 text-sm hover-highlight rounded no-drag"
            title={isAlwaysOnTop() ? "Unpin from top" : "Pin to top"}
          >
            <Icon
              icon={
                isAlwaysOnTop()
                  ? "material-symbols:push-pin"
                  : "material-symbols:push-pin-outline"
              }
              class="w-4 h-4"
            />
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            class="px-3 py-1.5 text-sm hover-highlight rounded no-drag flex items-center gap-1"
            title="Export to Obsidian"
          >
            <Icon icon="simple-icons:obsidian" class="w-4 h-4" />
            <span class="text-xs">Export</span>
            <Icon
              icon="material-symbols:keyboard-arrow-right"
              class="w-3 h-3 opacity-60"
            />
          </button>
          <ThemeToggle />
          <button
            onClick={hideToMenuBar}
            class="px-3 py-1.5 text-sm hover-highlight rounded no-drag"
          >
            Hide
          </button>
          <button
            onClick={() => setShowSettings(true)}
            class="px-3 py-1.5 text-sm hover-highlight rounded no-drag flex items-center gap-1"
            title="Settings"
          >
            <Icon icon="material-symbols:settings" class="w-4 h-4" />
            <Icon
              icon="material-symbols:keyboard-arrow-right"
              class="w-3 h-3 opacity-60"
            />
          </button>
        </div>
      </div>

      {/* Selectors Section - Boules de Billard */}
      <div class="sidebar-glass border-b border-macos-border px-6 py-2">
        <div class="flex flex-col gap-2">
          {/* Nom du sélecteur centré */}
          <div class="text-center relative">
            <Show when={isRenamingSelector()} fallback={
              <Show when={selectorsStore.activeSelector} fallback={
                <div class="text-lg font-medium text-macos-text-secondary cursor-pointer hover:text-macos-text transition-colors" onClick={() => console.log('Renommer groupe')}>
                  Groupe {selectorsStore.currentGroup + 1}/10
                </div>
              }>
                <div 
                  class="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg animate-pulse cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => {
                    setRenameValue(selectorsStore.activeSelector?.name || '');
                    setIsRenamingSelector(true);
                  }}
                >
                  {selectorsStore.activeSelector?.name || selectorsStore.activeSelector?.id}
                </div>
              </Show>
            }>
              {/* Input de renommage */}
              <input
                type="text"
                value={renameValue()}
                onInput={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (selectorsStore.activeSelector) {
                      selectorsStore.renameSelector(selectorsStore.activeSelector.id, renameValue());
                    }
                    setIsRenamingSelector(false);
                  } else if (e.key === 'Escape') {
                    setIsRenamingSelector(false);
                  }
                }}
                onBlur={() => {
                  if (selectorsStore.activeSelector) {
                    selectorsStore.renameSelector(selectorsStore.activeSelector.id, renameValue());
                  }
                  setIsRenamingSelector(false);
                }}
                class="text-2xl font-bold bg-transparent border border-blue-400 rounded px-2 py-1 text-center text-macos-text outline-none"
                placeholder="Nom du sélecteur"
                ref={(el) => setTimeout(() => el?.focus(), 0)}
              />
            </Show>
            
            {/* Chiffres 1-10 à droite */}
            <div class="absolute right-0 top-1/2 transform -translate-y-1/2 flex gap-1">
              <For each={Array.from({length: 10}, (_, i) => i + 1)}>
                {(groupNum) => (
                  <button
                    class={`w-6 h-6 rounded text-xs font-bold transition-all duration-200 ${
                      selectorsStore.currentGroup === groupNum - 1
                        ? 'bg-blue-500 text-white'
                        : 'bg-macos-hover/30 text-macos-text-secondary hover:bg-macos-hover hover:text-macos-text'
                    }`}
                    onClick={() => selectorsStore.navigateToGroup(groupNum - 1)}
                    title={`Groupe ${groupNum}`}
                  >
                    {groupNum}
                  </button>
                )}
              </For>
            </div>
          </div>
          
          {/* Flèches + Grille des sélecteurs sur la même ligne */}
          <div class="flex items-center justify-center gap-4" style="align-items: center">
            {/* Flèche gauche - SVG custom GROS */}
            <Show when={selectorsStore.currentGroup > 0}>
              <button
                class="w-16 h-16 flex items-center justify-center hover:bg-macos-hover/20 rounded-full transition-all duration-200 hover:scale-110"
                onClick={() => selectorsStore.navigateToGroup(selectorsStore.currentGroup - 1)}
                title="Groupe précédent"
              >
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" class="text-macos-text">
                  <path 
                    d="M30 36L18 24L30 12" 
                    stroke="currentColor" 
                    stroke-width="4" 
                    stroke-linecap="round" 
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </Show>
            
            {/* Grille des sélecteurs */}
            <SelectorGrid
              selectors={selectorsStore.getCurrentGroupSelectors()}
              onSelectorClick={(id) => selectorsStore.setActiveSelector(id)}
              onSelectorDoubleClick={handleSelectorDoubleClick}
              currentGroup={selectorsStore.currentGroup}
            />
            
            {/* Flèche droite - SVG custom GROS */}
            <Show when={selectorsStore.currentGroup < selectorsStore.totalGroups - 1}>
              <button
                class="w-16 h-16 flex items-center justify-center hover:bg-macos-hover/20 rounded-full transition-all duration-200 hover:scale-110"
                onClick={() => selectorsStore.navigateToGroup(selectorsStore.currentGroup + 1)}
                title="Groupe suivant"
              >
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" class="text-macos-text">
                  <path 
                    d="M18 12L30 24L18 36" 
                    stroke="currentColor" 
                    stroke-width="4" 
                    stroke-linecap="round" 
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </Show>
          </div>
        </div>
      </div>

      {/* Editor Area */}
      <div class="flex flex-col" style={{ height: `${editorHeight()}%` }}>
        <div class="flex-1 flex flex-col">
          <Show
            when={selectedNote()}
            fallback={
              <div class="flex-1 flex items-center justify-center">
                <div class="text-center opacity-50">
                  <p class="text-macos-text-secondary text-sm">
                    No note selected
                  </p>
                </div>
              </div>
            }
          >
            <div class="flex-1 flex flex-col p-6">
              {/* Title Field */}
              <div class="flex items-center justify-between mb-1">
                <div class="flex-1 flex items-center gap-3">
                  <input
                    type="text"
                    value={noteTitle()}
                    onInput={(e) => setNoteTitle(e.target.value)}
                    onBlur={saveCurrentNote}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault(); // Prevent default form submission
                        // Move cursor to beginning of content area when Enter is pressed
                        const contentTextarea = document.querySelector(
                          "textarea"
                        ) as HTMLTextAreaElement;
                        if (contentTextarea) {
                          contentTextarea.focus();
                          // Force cursor to absolute beginning, even if there's existing content
                          setTimeout(() => {
                            contentTextarea.setSelectionRange(0, 0);
                            contentTextarea.scrollTop = 0; // Also scroll to top
                          }, 0);
                        }
                      }
                    }}
                    class="flex-1 text-2xl font-semibold bg-transparent border-none outline-none text-macos-text no-drag"
                    placeholder="Note title..."
                    ref={(el) => {
                      // Auto-focus title when note is selected
                      if (el && selectedNote()) {
                        setTimeout(() => el.focus(), 100);
                      }
                    }}
                  />
                </div>
                <div class="flex items-center space-x-2">
                  <button
                    onClick={() => setShowCategoryManager(true)}
                    class="p-2 hover-highlight rounded no-drag flex items-center gap-1"
                    title="Manage categories"
                  >
                    <Icon icon="material-symbols:category" class="w-4 h-4" />
                    <Icon
                      icon="material-symbols:keyboard-arrow-right"
                      class="w-3 h-3 opacity-60"
                    />
                  </button>
                  <button
                    onClick={togglePreviewMode}
                    class={`p-2 hover-highlight rounded no-drag flex items-center gap-1 ${showPreview() ? "bg-blue-500/20 text-blue-400" : ""}`}
                    title={
                      showPreview()
                        ? "Switch to edit mode"
                        : "Preview with clickable links"
                    }
                  >
                    <Icon
                      icon={
                        showPreview()
                          ? "material-symbols:edit"
                          : "material-symbols:visibility"
                      }
                      class="w-4 h-4"
                    />
                    <Icon
                      icon="material-symbols:keyboard-arrow-right"
                      class="w-3 h-3 opacity-60"
                    />
                  </button>
                  <button
                    onClick={showVersionHistory}
                    class="p-2 hover-highlight rounded no-drag"
                    title="View version history"
                  >
                    <Icon icon="material-symbols:history" class="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      const note = selectedNote();
                      if (note) togglePinNote(note.id);
                    }}
                    class="p-2 hover-highlight rounded no-drag"
                    title="Pin note"
                  >
                    <Icon
                      icon={
                        selectedNote()?.isPinned
                          ? "material-symbols:push-pin"
                          : "material-symbols:push-pin-outline"
                      }
                      class="w-4 h-4"
                    />
                  </button>
                  <button
                    onClick={() => {
                      const note = selectedNote();
                      if (note) {
                        if (preferences().editor.confirm_delete) {
                          setNoteToDelete(note.id);
                          setShowDeleteConfirm(true);
                        } else {
                          // Delete without confirmation
                          deleteNote(note.id);
                          setSelectedNote(null);
                          setNoteTitle("");
                          setNoteContent("");
                        }
                      }
                    }}
                    class="p-2 hover-highlight rounded text-red-400 no-drag"
                    title="Delete note"
                  >
                    <Icon
                      icon="material-symbols:delete-outline"
                      class="w-4 h-4"
                    />
                  </button>
                </div>
              </div>

              {/* Content Editor/Preview */}
              <Show
                when={!showPreview()}
                fallback={
                  <div class="flex-1 p-4 overflow-y-auto native-scrollbar leading-relaxed">
                    <MarkdownPreview
                      content={noteContent()}
                      noteList={notes()}
                      onWikiLinkClick={handleWikiLinkClick}
                    />
                  </div>
                }
              >
                <div class="flex-1 flex flex-col">
                  <EnhancedEditor
                    value={noteContent()}
                    onInput={(value) => {
                      setNoteContent(value);
                      // Check for WikiLink auto-completion
                      const textarea = document.querySelector(
                        "textarea"
                      ) as HTMLTextAreaElement;
                      if (textarea) {
                        const cursorPos = textarea.selectionStart || 0;
                        const wikiLinkInfo = findWikiLinkAtCursor(
                          value,
                          cursorPos
                        );

                        if (
                          wikiLinkInfo.isInWikiLink &&
                          wikiLinkInfo.linkText !== undefined
                        ) {
                          const matches = getAutoCompleteMatches(
                            wikiLinkInfo.linkText,
                            notes()
                          );
                          setAutoCompleteResults(matches);

                          if (matches.length > 0) {
                            const rect = textarea.getBoundingClientRect();
                            setAutoCompletePosition({
                              top: rect.top + 20,
                              left: rect.left + 10,
                            });
                            setShowAutoComplete(true);
                          } else {
                            setShowAutoComplete(false);
                          }
                        } else {
                          setShowAutoComplete(false);
                        }
                      }
                    }}
                    onBlur={saveCurrentNote}
                    placeholder="Write your note with markdown support..."
                  />
                </div>
              </Show>
            </div>
          </Show>
        </div>
      </div>

      {/* Auto-complete Dropdown */}
      <Show when={showAutoComplete()}>
        <div
          class="fixed z-50 bg-black/90 backdrop-blur-md border border-macos-border rounded-lg shadow-2xl max-w-xs"
          style={{
            top: `${autoCompletePosition().top}px`,
            left: `${autoCompletePosition().left}px`,
          }}
        >
          <div class="p-2">
            <div class="text-xs text-macos-text-secondary mb-2 px-2 flex items-center gap-1">
              <Icon icon="material-symbols:link" class="w-3 h-3" />
              Link to note:
            </div>
            <For each={autoCompleteResults()}>
              {(note, index) => (
                <div
                  class="px-3 py-2 hover:bg-macos-hover rounded cursor-pointer text-sm transition-colors"
                  onClick={() => insertAutoComplete(note.title)}
                >
                  <div class="font-medium">{note.title}</div>
                </div>
              )}
            </For>
            <Show when={autoCompleteResults().length === 0}>
              <div class="px-3 py-2 text-sm text-macos-text-secondary italic">
                No existing notes found
              </div>
            </Show>
          </div>
        </div>
      </Show>

      {/* Resize Handle */}
      <ResizeHandle
        onResize={setEditorHeight}
        currentHeight={editorHeight()}
      />

      {/* Bottom Notes List - nvALT Style */}
      <div class="flex-1 sidebar-glass border-t border-macos-border">
        <div class="p-4 h-full">
          <div class="mb-3">
            <input
              type="text"
              value={searchQuery()}
              onInput={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${notes().length} notes...`}
              class="w-full px-3 py-2 text-xs bg-macos-hover border border-macos-border rounded-lg outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div class="space-y-1 max-h-96 overflow-y-auto native-scrollbar">
            {(() => {
              console.log('🎯 DAVE DEBUG: Rendu de la liste des notes');
              const notesToDisplay = filteredNotesForDisplay();
              console.log('🎯 DAVE DEBUG: filteredNotesForDisplay() =', notesToDisplay);
              console.log('🎯 DAVE DEBUG: notesToDisplay.length =', notesToDisplay.length);
              return null;
            })()}
            <For
              each={filteredNotesForDisplay()}
              fallback={
                <p class="text-macos-text-secondary text-sm italic py-4">
                  {console.log('🎯 DAVE DEBUG: Fallback affiché - searchQuery:', searchQuery())}
                  {searchQuery() ? "No matching notes" : "No notes yet"}
                </p>
              }
            >
              {(note) => (
                <div
                  class={`w-full p-2 rounded cursor-pointer transition-colors no-drag text-left border-b border-macos-border ${
                    selectedNote()?.id === note.id
                      ? "bg-macos-hover border border-macos-border"
                      : "hover-highlight"
                  }`}
                  onClick={() => {
                    console.log('🔍 Note clicked:', { noteId: note.id, selectedNoteId: selectedNote()?.id, isSelected: selectedNote()?.id === note.id });
                    setSelectedNote(note);
                    setNoteTitle(note.title);
                    setNoteContent(note.content);
                  }}
                >
                  <div class="flex items-center">
                    {/* Selector Column */}
                    <div class="w-12 flex-shrink-0 flex justify-center items-center">
                      <NoteSelectorColumn
                        selectorId={note.selectorId}
                        noteId={note.id}
                        onClick={handleSelectorClick}
                        onAssign={handleAssignSelector}
                      />
                    </div>

                    {/* Title Column with resize */}
                    <div
                      class="flex items-center"
                      style={{ width: `${titleColumnWidth()}px` }}
                    >
                      <div class="flex-1 min-w-0 px-1">
                        <div class="text-sm font-semibold truncate flex items-center gap-1">
                          {note.isPinned && (
                            <Icon
                              icon="material-symbols:push-pin"
                              class="w-3 h-3 text-blue-400"
                            />
                          )}
                          {getCategoryInfo(note.categoryId) && (
                            <div
                              class="w-2 h-2 rounded-full border border-white/20"
                              style={{
                                backgroundColor: getCategoryInfo(
                                  note.categoryId
                                )!.color,
                              }}
                              title={getCategoryInfo(note.categoryId)!.name}
                            />
                          )}
                          <span title={note.title}>{note.title}</span>
                        </div>
                      </div>
                      {/* Resize handle */}
                      <div
                        class="w-1 h-full cursor-col-resize bg-blue-500/50 transition-colors"
                        onMouseDown={handleTitleColumnResize}
                      />
                    </div>

                    {/* Content Preview Column */}
                    <div class="flex-1 min-w-0 px-1.5">
                      <div class="text-xs text-macos-text-secondary truncate flex items-center gap-2">
                        <span>
                          {note.content.split("\n")[0] || "Empty note"}
                        </span>
                        {getCategoryInfo(note.categoryId) && (
                          <span
                            class="text-xs px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor:
                                getCategoryInfo(note.categoryId)!.color + "20",
                              color: getCategoryInfo(note.categoryId)!.color,
                            }}
                          >
                            {getCategoryInfo(note.categoryId)!.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Delete Column */}
                    <div class="flex-shrink-0 px-2">
                      <button
                        onClick={() => {
                          const note = selectedNote();
                          if (note) {
                            if (preferences().editor.confirm_delete) {
                              setNoteToDelete(note.id);
                              setShowDeleteConfirm(true);
                            } else {
                              // Delete without confirmation
                              deleteNote(note.id);
                              setSelectedNote(null);
                              setNoteTitle("");
                              setNoteContent("");
                            }
                          }
                        }}
                        class="p-2 hover-highlight rounded text-red-400 no-drag"
                        title="Delete note"
                      >
                        <Icon
                          icon="material-symbols:delete-outline"
                          class="w-4 h-4"
                        />
                      </button>
                    </div>
                    {/* Timestamp Column */}
                    <div class="flex-shrink-0 px-2">
                      <span class="text-xs text-macos-text-secondary">
                        {formatNoteDate(note.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </For>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div class="h-6 bg-macos-border/50 backdrop-blur-md flex items-center justify-between px-4 text-xs text-macos-text-secondary border-t border-macos-border">
        <div class="flex items-center space-x-4">
          <span class="flex items-center gap-1">
            <Icon icon="material-symbols:note" class="w-3 h-3" />
            {notes().length} notes
          </span>
          <Show when={selectedNote()}>
            <span class="flex items-center gap-1">
              <Icon icon="material-symbols:edit" class="w-3 h-3" />
              Editing: {selectedNote()?.title}
            </span>
          </Show>
          <Show when={lastSaved()}>
            <span class="flex items-center gap-1">
              <Icon icon="material-symbols:save" class="w-3 h-3" />
              Saved: {lastSaved()?.toLocaleTimeString()}
            </span>
          </Show>
        </div>
        <div class="flex items-center space-x-2">
          <span class="flex items-center gap-1">
            <Icon icon="material-symbols:schedule" class="w-3 h-3" />
            {currentTime().toLocaleTimeString()}
          </span>
          <span class="flex items-center gap-1">
            <Icon icon="material-symbols:calendar-today" class="w-3 h-3" />
            {currentTime().toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Show when={showDeleteConfirm()}>
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div class="bg-macos-bg border border-macos-border rounded-lg p-6 max-w-sm mx-4">
            <h3 class="text-lg font-semibold mb-4">Delete Note?</h3>
            <p class="text-macos-text-secondary mb-6">
              Are you sure you want to delete "
              {notes().find((n) => n.id === noteToDelete())?.title}"? This
              action cannot be undone.
            </p>
            <div class="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setNoteToDelete(null);
                }}
                class="px-4 py-2 glass-morphism hover-highlight rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const id = noteToDelete();
                  if (id) {
                    deleteNote(id);
                    if (selectedNote()?.id === id) {
                      setSelectedNote(null);
                      setNoteTitle("");
                      setNoteContent("");
                    }
                  }
                  setShowDeleteConfirm(false);
                  setNoteToDelete(null);
                }}
                class="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-sm text-red-400"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </Show>

      {/* Settings Modal */}
      <Show when={showSettings()}>
        <SettingsPanel onClose={() => setShowSettings(false)} />
      </Show>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal()}
        onClose={() => setShowExportModal(false)}
      />

      {/* Category Manager Modal */}
      <Show when={showCategoryManager()}>
        <CategoryManager onClose={() => setShowCategoryManager(false)} />
      </Show>
    </div>
  );
};

export default App;
