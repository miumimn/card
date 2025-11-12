export function SocialIcons({ socials = {} }) {
  const icons = {
    instagram: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M7 2C4.24 2 2 4.24 2 7v10c0 2.76 2.24 5 5 5h10c2.76 0 5-2.24 5-5V7c0-2.76-2.24-5-5-5H7zm10 2c1.65 0 3 1.35 3 3v10c0 1.65-1.35 3-3 3H7c-1.65 0-3-1.35-3-3V7c0-1.65 1.35-3 3-3h10zm-5 3a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm4.75-.5a.75.75 0 100 1.5.75.75 0 000-1.5z" />
      </svg>
    ),
    linkedin: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8h4V24h-4V8zm7.5 0h3.8v2.16h.05c.53-.98 1.83-2.16 3.77-2.16 4.03 0 4.77 2.65 4.77 6.09V24h-4v-7.91c0-1.88-.03-4.29-2.62-4.29-2.62 0-3.02 2.05-3.02 4.16V24h-4V8z" />
      </svg>
    ),
    twitter: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23 2.999a10.9 10.9 0 01-3.14.86A5.48 5.48 0 0022.43.36a10.88 10.88 0 01-3.46 1.32A5.47 5.47 0 0016.11 0c-3.04 0-5.5 2.46-5.5 5.5 0 .43.05.85.14 1.25A15.58 15.58 0 011.64.89a5.49 5.49 0 001.7 7.33 5.48 5.48 0 01-2.49-.68v.07c0 2.67 1.9 4.89 4.43 5.4a5.48 5.48 0 01-2.48.09 5.5 5.5 0 005.13 3.81A11 11 0 010 21.54a15.52 15.52 0 008.42 2.46c10.1 0 15.64-8.37 15.64-15.64 0-.24-.01-.48-.02-.72A11.15 11.15 0 0023 2.999z" />
      </svg>
    ),
  };

  return (
    <div className="flex justify-center gap-3 mt-3">
      {Object.entries(socials).map(
        ([key, url]) =>
          url &&
          icons[key] && (
            <a
              key={key}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-indigo-500"
            >
              {icons[key]}
            </a>
          )
      )}
    </div>
  );
}
