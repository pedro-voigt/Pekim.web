import { useState } from 'react';
import useMediaQuery from '../../hooks/useMediaQuery';

const C = {
  green:     '#0A3323',
  sage:      '#839958',
  rose:      '#D3968C',
  paper:     '#F7F4D5',
  sagesoft:  '#a8bc80',
  greensoft: '#2e5c3a',
  line:      '#D8D9B0',
};

const SORT_OPTIONS = [
  { value: 'id',       label: 'recém-adicionados' },
  { value: 'category', label: 'categoria' },
  { value: 'cost',     label: 'custo' },
  { value: 'status',   label: 'status' },
];

export default function DatesToolbar({
  isEditing,
  onToggleForm,
  onToggleFilters,
  activeCount,
  sort,
  onSort,
}) {
  const [hoverForm,   setHoverForm]   = useState(false);
  const [hoverFilter, setHoverFilter] = useState(false);
  const isMobile = useMediaQuery("(max-width: 560px)");

  return (
    <div style={{ marginBottom: '16px' }}>
      {/* Buttons row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>

        {/* Primary: inventar um date */}
        <button
          onClick={onToggleForm}
          onMouseEnter={() => setHoverForm(true)}
          onMouseLeave={() => setHoverForm(false)}
          style={{
            fontFamily:    "'Cormorant Garamond', serif",
            fontStyle:     'italic',
            fontSize:      '14px',
            color:         hoverForm ? C.paper : C.green,
            background:    hoverForm ? C.green : 'transparent',
            border:        `1px solid ${C.green}`,
            padding:       '8px 20px',
            cursor:        'pointer',
            transition:    'color 0.2s, background 0.2s',
            letterSpacing: '0.02em',
          }}
        >
          {isEditing ? 'editando date' : '+ inventar um date'}
        </button>

        {/* Ghost: filtrar */}
        <button
          onClick={onToggleFilters}
          onMouseEnter={() => setHoverFilter(true)}
          onMouseLeave={() => setHoverFilter(false)}
          style={{
            display:    'flex',
            alignItems: 'center',
            gap:        '7px',
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle:  'italic',
            fontSize:   '14px',
            color:      hoverFilter ? C.paper : C.greensoft,
            background: hoverFilter ? C.sage : 'transparent',
            border:     `1px solid ${C.sagesoft}`,
            padding:    '8px 18px',
            cursor:     'pointer',
            transition: 'color 0.2s, background 0.2s',
          }}
        >
          <span style={{ fontSize: '13px', lineHeight: 1 }}>⊟</span>
          filtrar
          {activeCount > 0 && (
            <span style={{
              background:  C.rose,
              color:       '#fff',
              borderRadius:'50%',
              width:       '18px',
              height:      '18px',
              fontSize:    '10px',
              display:     'inline-flex',
              alignItems:  'center',
              justifyContent: 'center',
            }}>
              {activeCount}
            </span>
          )}
        </button>

        {/* Sort select — à direita no desktop, nova linha no mobile */}
        {!isMobile && (
          <div style={{ marginLeft: 'auto' }}>
            <SortSelect sort={sort} onSort={onSort} />
          </div>
        )}
      </div>

      {/* Sort no mobile: linha própria */}
      {isMobile && (
        <div style={{ marginTop: '10px' }}>
          <SortSelect sort={sort} onSort={onSort} />
        </div>
      )}

      {/* Legenda de cores */}
      <div style={{
        display:    'flex',
        alignItems: 'center',
        gap:        isMobile ? '6px' : '10px',
        marginTop:  '12px',
        flexWrap:   'wrap',
        fontFamily: "'Cormorant Garamond', serif",
        fontStyle:  'italic',
        fontSize:   isMobile ? '14px' : '17px',
        color:      C.sage,
      }}>
        <LegendItem color="#0A3323" label="o mais elaborado" />
        <span style={{ opacity: 0.4 }}>•</span>
        <LegendItem color="#D3968C" label="fácil e barato" />
        <span style={{ opacity: 0.4 }}>•</span>
        <LegendItem color="#F7F4D5" label="nossos planos" border="#D8D9B0" />
      </div>
    </div>
  );
}

function SortSelect({ sort, onSort }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontStyle:  'italic',
        fontSize:   '15px',
        color:      '#839958',
        whiteSpace: 'nowrap',
      }}>
        ordenar por:
      </span>
      <select
        value={sort}
        onChange={e => onSort(e.target.value)}
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle:  'italic',
          fontSize:   '15px',
          color:      '#2e5c3a',
          background: 'transparent',
          border:     `1px solid ${C.line}`,
          padding:    '6px 12px',
          cursor:     'pointer',
          outline:    'none',
        }}
      >
        {SORT_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function LegendItem({ color, label, border }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
      <span style={{
        display:     'inline-block',
        width:       '10px',
        height:      '10px',
        background:  color,
        borderRadius:'1px',
        flexShrink:  0,
        ...(border ? { border: `1px solid ${border}` } : {}),
      }} />
      {label}
    </span>
  );
}
