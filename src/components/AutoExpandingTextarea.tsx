import React, { useEffect, useRef } from 'react';

interface AutoExpandingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  minHeight?: number;
}

export const AutoExpandingTextarea: React.FC<AutoExpandingTextareaProps> = ({
  value,
  onChange,
  minHeight = 120,
  className = '',
  placeholder,
  required,
  ...props
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Reset height momentarily to measure scrollHeight accurately
    textarea.style.height = 'auto';
    const newHeight = Math.max(minHeight, textarea.scrollHeight);
    textarea.style.height = `${newHeight}px`;
  };

  useEffect(() => {
    resizeTextarea();
  }, [value, minHeight]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => {
        onChange(e);
        resizeTextarea();
      }}
      placeholder={placeholder}
      required={required}
      rows={1}
      className={`overflow-hidden resize-none transition-[height] duration-75 ease-out ${className}`}
      style={{ minHeight: `${minHeight}px` }}
      {...props}
    />
  );
};
