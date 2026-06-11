import useMediaQuery from "../../hooks/useMediaQuery";

const C = {
  green: '#0A3323',
  sage:  '#839958',
  rose:  '#D3968C',
};

export default function DatesHeader({ total }) {
  const isMobile = useMediaQuery("(max-width: 560px)");

  return (
    <div style={{ position: 'relative', marginBottom: isMobile ? '24px' : '32px' }}>
      <p style={{
        fontFamily:    "'Cormorant Garamond', serif",
        fontStyle:     'italic',
        fontSize:      isMobile ? '15px' : '18px',
        color:         C.rose,
        margin:        '0 0 4px',
        letterSpacing: '0.02em',
      }}>
        o que ainda vamos viver — e o que já vivemos
      </p>

      <div style={{ position: 'relative', paddingRight: isMobile ? '90px' : '130px' }}>
        <h1 style={{
          fontFamily:    "'Playfair Display', serif",
          fontSize:      'clamp(48px, 12vw, 100px)',
          fontWeight:    500,
          lineHeight:    0.85,
          letterSpacing: '-0.025em',
          color:         C.green,
          marginLeft:    '-3px',
          marginTop:     0,
          marginBottom:  0,
        }}>
          Dates
        </h1>

        <div style={{ position: 'absolute', right: 0, top: 0, textAlign: 'right' }}>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize:   'clamp(28px, 7vw, 56px)',
            fontWeight: 500,
            lineHeight: 1,
            color:      C.green,
          }}>
            {total}
          </div>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle:  'italic',
            fontSize:   isMobile ? '11px' : '13px',
            color:      C.sage,
            lineHeight: 1.15,
            marginTop:  '2px',
          }}>
            ideias<br />nossas
          </div>
        </div>
      </div>

      <p style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontStyle:  'italic',
        fontSize:   isMobile ? '18px' : '22px',
        color:      C.sage,
        margin:     isMobile ? '14px 0 16px' : '20px 0 20px',
      }}>
        um mural dos nossos planos e memórias.
      </p>

      <div style={{ height: '1px', background: C.green, opacity: 0.18 }} />
    </div>
  );
}
