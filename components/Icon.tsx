"use client";
import React, { useEffect, useState } from "react";

type SvgIconProps = {
  name: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  alt?: string;
  useImg?: boolean; // if true render <img src="/svg/name.svg" />, otherwise try <img> as well but same behavior
  ariaHidden?: boolean;
  style?: React.CSSProperties;
};

export default function SvgIcon({
  name,
  width = 18,
  height = 18,
  className = "",
  alt,
  useImg = false,
  ariaHidden = true,
  style,
}: SvgIconProps) {
  const [failed, setFailed] = useState(false);
  const src = `/svg/${name}.svg`;
  const label = alt ?? name;

  // reset failed flag if name changes
  useEffect(() => {
    setFailed(false);
  }, [name]);

  // Render <img> by default (keeps existing usage working).
  // If image fails to load, render a neutral inline SVG fallback so the browser doesn't render raw alt text (like "U").
  if (!failed) {
    return (
      <img
        src={src}
        alt={label}
        aria-hidden={ariaHidden}
        width={width}
        height={height}
        className={className}
        style={style}
        onError={(e) => {
          // Prevent default broken image icon / alt text being visually shown
          setFailed(true);
          // small console warning so you can find missing assets in devtools
          // eslint-disable-next-line no-console
          console.warn(`SvgIcon: failed to load ${src}`);
          // optionally replace with blank gif to avoid browser alt-letter rendering
          try {
            (e.target as HTMLImageElement).src = "";
          } catch {}
        }}
      />
    );
  }

  // Inline neutral SVG fallback (keeps visual layout and accessibility)
  return (
    <svg
      role="img"
      aria-label={label}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="2" y="2" width="20" height="20" rx="4" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 12c1.5-2 4-2 5.5-1.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="17" cy="7" r="1.6" fill="currentColor" />
    </svg>
  );
}