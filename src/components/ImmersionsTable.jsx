import React, { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { Calendar, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const IMMERSIONS_CSV_URL = 'https://docs.google.com/spreadsheets/d/1Bp9E3kQBuMcOvIpJP8Ys51N2tie8ZXBkvwhkK8UxSK8/export?format=csv&gid=0';

const normalizeText = (value = '') => value
  .toString()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim();

const DEFAULT_THEME_LINKS = new Map([
  ['branding & posicionamento de marca', 'https://bpm.arcaffo.com'],
  ['gestao financeira & investimentos', 'https://gfi.arcaffo.com'],
]);

const getSafeLink = (value) => {
  const rawValue = value?.toString().trim();
  if (!rawValue) return '';

  try {
    const normalizedUrl = /^[a-z][a-z\d+.-]*:/i.test(rawValue) ? rawValue : `https://${rawValue}`;
    const url = new URL(normalizedUrl);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
};

const getImmersionLink = (theme, configuredLink) => (
  getSafeLink(configuredLink) || DEFAULT_THEME_LINKS.get(normalizeText(theme)) || '#form'
);

const ImmersionsTable = () => {
  const [immersions, setImmersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    const fetchImmersions = async () => {
      try {
        const response = await fetch(IMMERSIONS_CSV_URL, { signal: controller.signal });
        if (!response.ok) throw new Error('Não foi possível carregar as imersões.');

        const csvText = await response.text();

        if (csvText.includes('<html') || csvText.includes('<!DOCTYPE')) {
             throw new Error('A Planilha Google está restrita. Por favor, altere o acesso para "Qualquer pessoa com o link pode ver" nas configurações de compartilhamento.');
        }

        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (!active) return;
            const data = results.data;
            if (data.length > 0) {
              const headers = Object.keys(data[0]);

              const findColumn = (keywords) => {
                 return headers.find(h => keywords.some(k => normalizeText(h).includes(normalizeText(k))));
              };

              const dataCol = findColumn(['data', 'date', 'quando']) || headers[0];
              const temaCol = findColumn(['tema', 'evento', 'nome', 'título']) || headers[1];
              const statusCol = findColumn(['status', 'estado']) || headers.find(h => h.toLowerCase().includes('status'));
              const linkCol = findColumn(['link', 'url', 'destino']);

              const filtered = data.filter(item => {
                 if (!statusCol) return true;
                 const status = normalizeText(item[statusCol]);
                 return status === 'nao iniciada';
              }).map(item => ({
                 date: item[dataCol],
                 theme: item[temaCol],
                 link: getImmersionLink(item[temaCol], linkCol ? item[linkCol] : '')
              }));

              setImmersions(filtered);
            }
            setLoading(false);
          },
          error: () => {
            if (!active) return;
            setError('Erro ao processar os dados da planilha.');
            setLoading(false);
          }
        });

      } catch (err) {
        if (err.name === 'AbortError' || !active) return;
        setError(err.message);
        setLoading(false);
      }
    };

    fetchImmersions();

    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <Loader2 size={32} color="var(--accent-mint)" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '16px', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Sincronizando imersões ao vivo...</p>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', background: 'rgba(255,100,100,0.05)', borderRadius: '24px', border: '1px solid rgba(255,100,100,0.1)' }}>
        <AlertCircle size={32} color="#ff6b6b" />
        <p style={{ marginTop: '16px', color: '#ff6b6b', fontSize: '14px', textAlign: 'center', maxWidth: '450px', lineHeight: '1.6' }}>{error}</p>
      </div>
    );
  }

  if (immersions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px' }}>Nenhuma imersão com inscrições abertas no momento.</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.01)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
            <th style={{ padding: '24px 32px', color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>Data</th>
            <th style={{ padding: '24px 32px', color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase' }}>Evento / Tema</th>
            <th style={{ padding: '24px 32px', color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', textAlign: 'right' }}>Ação</th>
          </tr>
        </thead>
        <tbody>
          {immersions.map((immersion, idx) => (
            <motion.tr
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              style={{ borderBottom: idx === immersions.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)' }}
              className="table-row-hover"
            >
              <td style={{ padding: '24px 32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: 'rgba(47, 209, 168, 0.1)', padding: '10px', borderRadius: '12px' }}>
                    <Calendar size={18} color="var(--accent-mint)" />
                  </div>
                  <span style={{ fontSize: '15px', fontWeight: '500', color: '#fff' }}>{immersion.date || 'A definir'}</span>
                </div>
              </td>
              <td style={{ padding: '24px 32px' }}>
                <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)', fontWeight: '300' }}>{immersion.theme || 'Imersão Estratégica'}</span>
              </td>
              <td style={{ padding: '24px 32px', textAlign: 'right' }}>
                <a
                  href={immersion.link}
                  aria-label={`Garantir vaga em ${immersion.theme || 'Imersão Estratégica'}`}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '12px 24px', borderRadius: '100px', fontSize: '13px', fontWeight: '600',
                    background: '#fff', color: '#000', textDecoration: 'none', transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                     e.currentTarget.style.background = 'var(--accent-mint)';
                     e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                     e.currentTarget.style.background = '#fff';
                     e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Garantir Vaga <ArrowRight size={14} />
                </a>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
      <style>{`
        .table-row-hover {
          transition: background 0.3s ease;
        }
        .table-row-hover:hover {
          background: rgba(255,255,255,0.02);
        }
      `}</style>
    </div>
  );
};

export default ImmersionsTable;
