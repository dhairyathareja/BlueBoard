import React from 'react';
import Loader from './Loader';
import EmptyState from './EmptyState';

const Table = ({ columns = [], data = [], isLoading = false, emptyTitle = 'No Records Found', emptyDescription }) => {
  if (isLoading) {
    return <Loader />;
  }

  if (!data || data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div style={{ width: '100%', overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', backdropFilter: 'var(--glass-blur)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(0, 0, 0, 0.2)' }}>
            {columns.map((col, idx) => (
              <th
                key={idx}
                style={{
                  padding: '16px 20px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontFamily: 'var(--font-display)',
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr
              key={row._id || rowIdx}
              style={{
                borderBottom: rowIdx === data.length - 1 ? 'none' : '1px solid var(--border-color)',
                transition: 'background-color var(--transition-fast)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {columns.map((col, colIdx) => (
                <td
                  key={colIdx}
                  style={{
                    padding: '16px 20px',
                    fontSize: '0.9rem',
                    color: 'var(--text-primary)',
                    verticalAlign: 'middle',
                  }}
                >
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
