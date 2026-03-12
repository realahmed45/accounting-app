import React, { useState } from "react";
import { HelpCircle, Info } from "lucide-react";

/**
 * Tooltip component for providing contextual help and instructions
 * Shows on hover or click for mobile devices
 */
const Tooltip = ({
  content,
  children,
  position = "top",
  variant = "info",
  trigger = "hover",
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowPositions = {
    top: "top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent",
    bottom:
      "bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent",
    left: "left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent",
    right:
      "right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent",
  };

  const variantStyles = {
    info: "bg-blue-600 text-white",
    help: "bg-slate-800 text-white",
    success: "bg-emerald-600 text-white",
    warning: "bg-amber-600 text-white",
  };

  const showTooltip = () => setIsVisible(true);
  const hideTooltip = () => setIsVisible(false);
  const toggleTooltip = () => setIsVisible(!isVisible);

  const eventHandlers =
    trigger === "hover"
      ? { onMouseEnter: showTooltip, onMouseLeave: hideTooltip }
      : { onClick: toggleTooltip };

  return (
    <div className={`relative inline-block ${className}`} {...eventHandlers}>
      {children}
      {isVisible && (
        <div
          className={`
            absolute z-50 
            ${positionClasses[position]}
            ${variantStyles[variant]}
            px-3 py-2 rounded-lg
            text-sm font-medium
            shadow-lg
            max-w-xs
            whitespace-normal
            animate-fadeIn
          `}
          style={{ minWidth: "200px" }}
        >
          {content}
          <div
            className={`
              absolute w-0 h-0
              ${arrowPositions[position]}
              border-4
              ${variant === "info" && "border-blue-600"}
              ${variant === "help" && "border-slate-800"}
              ${variant === "success" && "border-emerald-600"}
              ${variant === "warning" && "border-amber-600"}
            `}
          />
        </div>
      )}
    </div>
  );
};

/**
 * HelpIcon component - Standard help icon with tooltip
 */
export const HelpIcon = ({ content, position = "top" }) => (
  <Tooltip content={content} position={position} variant="help">
    <button className="inline-flex items-center justify-center w-5 h-5 rounded-full hover:bg-slate-200 transition-colors">
      <HelpCircle className="w-4 h-4 text-slate-500 hover:text-slate-700" />
    </button>
  </Tooltip>
);

/**
 * InfoBadge component - Info icon with tooltip
 */
export const InfoBadge = ({ content, position = "top" }) => (
  <Tooltip content={content} position={position} variant="info">
    <button className="inline-flex items-center justify-center w-5 h-5 rounded-full hover:bg-blue-50 transition-colors">
      <Info className="w-4 h-4 text-blue-500 hover:text-blue-700" />
    </button>
  </Tooltip>
);

/**
 * InstructionBox component - Visible instruction panel
 */
export const InstructionBox = ({
  title,
  children,
  icon: Icon,
  variant = "info",
}) => {
  const variants = {
    info: "bg-blue-50 border-blue-200 text-blue-900",
    success: "bg-emerald-50 border-emerald-200 text-emerald-900",
    warning: "bg-amber-50 border-amber-200 text-amber-900",
    tip: "bg-purple-50 border-purple-200 text-purple-900",
  };

  const iconColors = {
    info: "text-blue-600",
    success: "text-emerald-600",
    warning: "text-amber-600",
    tip: "text-purple-600",
  };

  return (
    <div className={`border-l-4 p-4 rounded-r-lg ${variants[variant]}`}>
      <div className="flex items-start gap-3">
        {Icon && (
          <Icon
            className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColors[variant]}`}
          />
        )}
        <div className="flex-1">
          {title && <div className="font-semibold mb-1">{title}</div>}
          <div className="text-sm leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Tooltip;
