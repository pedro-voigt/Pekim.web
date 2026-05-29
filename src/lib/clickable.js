// Spread these props onto a non-button element to make it keyboard-accessible.
// Use when the element must remain a <div> (e.g. contains child buttons).
export default function clickable(handler, extra = {}) {
  return {
    role: "button",
    tabIndex: 0,
    onClick: handler,
    onKeyDown: (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handler(e);
      }
    },
    ...extra,
  };
}
