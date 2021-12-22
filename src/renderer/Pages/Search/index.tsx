import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useEffect, useRef, useState } from 'react';
import { getHistories, copyItem } from '../../services';
import type { NativeImage } from 'electron';

type Data = {
  text?: string;
  html?: string;
  image?: NativeImage;
  // for image only
  dataUrl?: string;
  ocr?: string;
  copy?: () => void;
};

interface ClipboardInfo {
  updateTime: number;
  list: Data[];
}

export default () => {
  const ref = useRef(null);
  const container = useRef(null);
  const [key, setKey] = useState(0);
  const [search, setSearch] = useState('');
  const [clipboardInfo, setClipboardInfo] = useState<ClipboardInfo>({
    list: [],
    updateTime: 0,
  });
  const [currentList, setCurrentList] = useState(clipboardInfo.list);

  useEffect(() => {
    getHistories().then((res) => {
      if (res.updateTime !== clipboardInfo.updateTime) {
        const newList = res.list.map((ele) => {
          return {
            ...ele,
            ocr: (ele.ocr || '').replace(/\s+/g, ''),
          };
        });
        setClipboardInfo({ updateTime: res.updateTime, list: newList });
      }
    });
  }, []);

  useEffect(() => {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        ref.current?.focus?.();
        container.current?.scrollTo?.(0, 0);
        requestAnimationFrame(() => {
          ref.current?.focus?.();
          container.current?.scrollTo?.(0, 0);
        });
      } else {
        setSearch('');
        setKey((k) => k + 1);
      }
    });
  }, []);

  useEffect(() => {
    setCurrentList(
      clipboardInfo.list.filter((ele) => {
        if (!search) {
          return true;
        }
        if (
          ele.text?.toLowerCase()?.includes(search?.toLowerCase()) ||
          ele.html?.toLowerCase()?.includes(search?.toLowerCase()) ||
          ele.ocr?.toLowerCase()?.includes(search?.toLowerCase())
        ) {
          return true;
        }
        return false;
      })
    );
  }, [clipboardInfo, search]);

  console.log(currentList);

  return (
    <div
      onMouseDown={(e) => {
        if ((e.target as any).tagName !== 'INPUT') {
          setSearch('');
          setKey((k) => k + 1);
          window.ipcRenderer.invoke('hide');
        }
      }}
      style={{
        background: 'transparent',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
      }}
    >
      <div style={{ width: 300, marginTop: 200, borderRadius: 12 }}>
        <Input
          key={key}
          spellCheck="false"
          style={{
            borderBottomLeftRadius: currentList.length === 0 ? 8 : 0,
            borderBottomRightRadius: currentList.length === 0 ? 8 : 0,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            outline: 'none',
            boxShadow: 'none',
            borderColor: '#e8e8e8',
            transition: 'none',
          }}
          value={search}
          suffix={<SearchOutlined onMouseDown={(e) => e.stopPropagation()} />}
          size="large"
          onChange={(e) => setSearch(e.target.value)}
          ref={ref}
          placeholder="搜索"
          autoFocus
        />
        <div
          ref={container}
          style={{
            maxHeight: 200,
            overflow: 'auto',
            background: 'white',
            borderRadius: 8,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            userSelect: 'none',
          }}
        >
          {currentList.map((item, index) =>
            !item.image ? (
              <div
                key={item.text + item.html + index}
                onClick={() => {
                  copyItem(item);
                }}
                style={{
                  padding: '16px',
                  fontSize: 14,
                  borderBottom:
                    index === currentList.length ? 'none' : '1px solid #e8e8e8',
                  cursor: 'pointer',
                }}
              >
                {item.html || item.text}
              </div>
            ) : (
              <div
                key={item.text + item.html + index}
                onClick={(e) => {
                  e.preventDefault();
                  copyItem(item);
                }}
                style={{
                  padding: '16px',
                  fontSize: 14,
                  borderBottom:
                    index === currentList.length ? 'none' : '1px solid #e8e8e8',
                  cursor: 'pointer',
                }}
              >
                <img width={268} src={item.image.toDataURL()} />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
