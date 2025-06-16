import { Component } from 'solid-js';

interface ResizeHandleProps {
  onResize: (newHeight: number) => void;
  currentHeight: number;
  minHeight?: number;
  maxHeight?: number;
}

const ResizeHandle: Component<ResizeHandleProps> = (props) => {
  const minHeight = () => props.minHeight ?? 20;
  const maxHeight = () => props.maxHeight ?? 80;

  const handleResizeStart = (e: MouseEvent) => {
    console.log('🔧 handleResizeStart appelé', { clientY: e.clientY, currentHeight: props.currentHeight });
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = props.currentHeight;

    const handleResize = (e: MouseEvent) => {
      const deltaY = e.clientY - startY;
      const containerHeight = window.innerHeight - 64; // minus header height
      const deltaPercentage = (deltaY / containerHeight) * 100;
      const newHeight = Math.max(
        minHeight(),
        Math.min(maxHeight(), startHeight + deltaPercentage)
      );
      props.onResize(newHeight);
    };

    const handleResizeEnd = () => {
      document.removeEventListener("mousemove", handleResize);
      document.removeEventListener("mouseup", handleResizeEnd);
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };

    document.addEventListener("mousemove", handleResize);
    document.addEventListener("mouseup", handleResizeEnd);
    document.body.style.cursor = "ns-resize";
    document.body.style.userSelect = "none";
  };

  return (
    <div
      class="h-1 bg-macos-border hover:bg-blue-500/50 cursor-ns-resize transition-colors no-drag"
      onMouseDown={handleResizeStart}
      title="Drag to resize editor"
    />
  );
};

export default ResizeHandle;