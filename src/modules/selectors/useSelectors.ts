import { createSignal } from 'solid-js';
import type { Selector } from '../../types/selectors';

export interface UseSelectorsOptions {
  selectorsPerGroup?: number;
  onRename?: (id: number, name: string) => void;
  onNavigate?: (group: number) => void;
}

export const useSelectors = (options: UseSelectorsOptions = {}) => {
  const { 
    selectorsPerGroup = 10,
    onRename,
    onNavigate
  } = options;

  const [currentGroup, setCurrentGroup] = createSignal(0);
  const [activeSelector, setActiveSelector] = createSignal<Selector>();

  const renameSelector = (id: number, newName: string) => {
    if (onRename) {
      onRename(id, newName);
    }
    // Update local active selector if it's the one being renamed
    const current = activeSelector();
    if (current?.id === id) {
      setActiveSelector({ ...current, name: newName });
    }
  };

  const navigateToGroup = (group: number) => {
    setCurrentGroup(group);
    if (onNavigate) {
      onNavigate(group);
    }
  };

  const navigatePrevious = () => {
    const current = currentGroup();
    if (current > 0) {
      navigateToGroup(current - 1);
    }
  };

  const navigateNext = (totalGroups: number) => {
    const current = currentGroup();
    if (current < totalGroups - 1) {
      navigateToGroup(current + 1);
    }
  };

  return {
    currentGroup,
    activeSelector,
    setActiveSelector,
    renameSelector,
    navigateToGroup,
    navigatePrevious,
    navigateNext,
    selectorsPerGroup
  };
};