import useMediaQuery from "../../hooks/useMediaQuery";

export default function PageContainer({ children, maxWidth = "900px" }) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  return (
    <div style={{
      padding: isMobile ? "24px 16px" : "40px 24px",
      maxWidth,
      margin: "0 auto",
    }}>
      {children}
    </div>
  );
}
