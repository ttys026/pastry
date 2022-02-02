import { Empty, Input } from 'antd';
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
    const updateList = () =>
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

    updateList();

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        updateList();
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
        const keyword = search.replace(/\s+/g, '');
        if (!keyword) {
          return true;
        }
        if (
          ele.text?.toLowerCase()?.includes(keyword?.toLowerCase()) ||
          ele.html?.toLowerCase()?.includes(keyword?.toLowerCase()) ||
          ele.ocr?.toLowerCase()?.includes(keyword?.toLowerCase())
        ) {
          return true;
        }
        return false;
      })
    );
  }, [clipboardInfo, search]);

  console.log(currentList);

  const hideWindow = () => {
    setSearch('');
    setKey((k) => k + 1);
    window.ipcRenderer.invoke('hide');
  };

  return (
    <div
      style={{
        width: 'fit-content',
      }}
    >
      <div style={{ width: 300, borderRadius: 12, overflow: 'hidden' }}>
        <Input
          key={key}
          spellCheck="false"
          style={{
            borderRadius: 0,
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
            height: 'fit-content',
            overflow: 'auto',
            background: 'white',
            userSelect: 'none',
          }}
        >
          {
            !currentList.length && <Empty description='没有结果' image={Empty.PRESENTED_IMAGE_SIMPLE} />
          }
          {currentList.map((item, index) =>
            !item.image ? (
              <div
                key={item.text + item.html + index}
                onClick={() => {
                  copyItem(item);
                  hideWindow();
                }}
                style={{
                  padding: '16px',
                  fontSize: 14,
                  wordBreak: 'break-all',
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
                  hideWindow();
                }}
                style={{
                  padding: '16px',
                  fontSize: 14,
                  borderBottom:
                    index === currentList.length ? 'none' : '1px solid #e8e8e8',
                  cursor: 'pointer',
                }}
              >
                <img width="100%" src={item.image.toDataURL()} />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
