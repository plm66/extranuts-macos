import { Component } from "solid-js";
import logoImg from "../../assets/extranuts-logo.png";

interface HeaderLogoProps {
  title?: string;
}

/**
 * HeaderLogo - Logo et titre de l'application
 * Style glassmorphism macOS
 */
export const HeaderLogo: Component<HeaderLogoProps> = (props) => {
  const title = () => props.title || "Extranuts";

  return (
    <div class="flex items-center justify-start">
      <img 
        src={logoImg} 
        alt="Extranuts Logo" 
        class="h-8 w-auto object-contain"
      />
    </div>
  );
};

export default HeaderLogo;