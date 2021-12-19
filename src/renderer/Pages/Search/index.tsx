import { Input } from 'antd';
import { useEffect, useRef, useState } from 'react';

export default () => {
  const ref = useRef(null);
  const [key, setKey] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        requestAnimationFrame(() => {
          ref.current?.focus();
        })
      } else {
        setSearch('');
        setKey(k => k + 1);
      }
    });
  }, []);

  return (
    <div
      onClick={() => {
        setSearch('');
        setKey(k => k + 1);
        window.ipcRenderer.invoke('hide');
      }}
      style={{
        background: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
      }}
    >
      <div style={{ width: 100, height: 100, background: 'yellow' }}>
        <Input
          key={key}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          ref={ref}
          placeholder="搜索"
          autoFocus
        />
      </div>
    </div>
  );
};
