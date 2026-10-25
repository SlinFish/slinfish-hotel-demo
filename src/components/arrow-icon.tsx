/** Decorative vector arrow: consistent rendering without a symbol-font dependency. */
export function ArrowIcon() {
  return (
    <svg
      className="arrow-icon"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M7 17 17 7M7 7h10v10" />
    </svg>
  );
}
