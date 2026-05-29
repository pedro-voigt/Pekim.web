const baseInput = {
  fontFamily: "'Cormorant Garamond', serif",
  fontStyle: "italic",
  fontSize: "15px",
  color: "#0A3323",
  background: "transparent",
  border: "none",
  borderBottom: "1px solid #D8D9B0",
  outline: "none",
  width: "100%",
  padding: "6px 0",
  boxSizing: "border-box",
};

const labelStyle = {
  fontSize: "10px",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#5a8060",
  fontFamily: "'Cormorant Garamond', serif",
  display: "block",
  marginBottom: "4px",
};

export function Label({ children }) {
  return <label style={labelStyle}>{children}</label>;
}

export function Input({ style, ...rest }) {
  return <input style={{ ...baseInput, ...style }} {...rest} />;
}

export function Select({ children, style, ...rest }) {
  return (
    <select style={{ ...baseInput, cursor: "pointer", ...style }} {...rest}>
      {children}
    </select>
  );
}

export function Textarea({ style, ...rest }) {
  return (
    <textarea
      style={{ ...baseInput, resize: "none", lineHeight: 1.8, ...style }}
      {...rest}
    />
  );
}
