import React from "react";

export default function Icon({ name }) {
  const paths = {
    menu: "M3 6h18M3 12h18M3 18h18",
    close: "m5 5 14 14M19 5 5 19",
    bag: "M5 7h14l1 15H4L5 7Z M8 8V5a4 4 0 0 1 8 0v3",
    search: "M16 16l5 5",
    user: "M4 22v-3a8 8 0 0 1 16 0v3",
    chevron: "m7 10 5 5 5-5",
  };
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {name === "search" && <circle cx="10.5" cy="10.5" r="6.5" />}
      {name === "user" && <circle cx="12" cy="7" r="4" />}
      <path d={paths[name] || paths.chevron} />
    </svg>
  );
}
