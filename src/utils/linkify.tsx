import React from 'react';

/**
 * Utility to convert URLs in plain text into clickable links
 */

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

export const linkifyText = (text: string): React.ReactNode => {
  if (!text) return null;

  const parts = text.split(URL_REGEX);

  return parts.map((part, index) => {
    if (part.match(URL_REGEX)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline break-all"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
};
