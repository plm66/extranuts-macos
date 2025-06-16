import { Component } from 'solid-js';
import SelectorTitle from './SelectorTitle';
import NavigationArrows from './NavigationArrows';
import GroupIndicator from './GroupIndicator';
import SelectorGrid from '../../components/SelectorGrid';
import type { Selector } from '../../types/selectors';

interface SelectorBarProps {
  activeSelector?: Selector;
  selectors: Selector[];
  currentGroup: number;
  totalGroups: number;
  onSelectorClick: (id: number) => void;
  onNavigateToGroup: (group: number) => void;
  onRenameSelector: (id: number, name: string) => void;
}

const SelectorBar: Component<SelectorBarProps> = (props) => {
  return (
    <div class="bg-macos-bg/50 backdrop-blur-md rounded-lg p-4 mb-4">
      <div class="relative mb-4">
        <SelectorTitle
          activeSelector={props.activeSelector}
          onRename={props.onRenameSelector}
        />
        <GroupIndicator
          currentGroup={props.currentGroup}
          totalGroups={props.totalGroups}
          onNavigateToGroup={props.onNavigateToGroup}
        />
      </div>
      
      <NavigationArrows
        currentGroup={props.currentGroup}
        totalGroups={props.totalGroups}
        onNavigate={props.onNavigateToGroup}
      >
        <SelectorGrid
          selectors={props.selectors}
          onSelectorClick={props.onSelectorClick}
          currentGroup={props.currentGroup}
        />
      </NavigationArrows>
    </div>
  );
};

export default SelectorBar;