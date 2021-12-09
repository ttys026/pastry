import { useEffect, useState } from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import dayjs from 'dayjs';

export default () => {
  const [log, setLog] = useState([]);
  useEffect(() => {
    const writeLog = (_, data) => {
      // @ts-ignore
      setLog((d) => [...d, `${dayjs().format('HH:mm:ss')}: ${data}`]);
    };
    window.ipcRenderer.on('log', writeLog);
    return () => {
      window.ipcRenderer.off('log', writeLog);
    };
  }, []);

  return (
    <div>
      <Button
        onClick={() => window.dispatchEvent(new Event('debugger'))}
        style={{ position: 'sticky', float: 'right', top: 8, margin: 8 }}
        size="small"
        type="text"
      >
        <CloseOutlined />
      </Button>
      <div style={{ padding: 16 }}>
        {
          log.length === 0 && <div>请尝试执行脚本，查看日志</div>
        }
        {log.map((ele, index) => (
          <div key={index}>{ele}</div>
        ))}
      </div>
    </div>
  );
};
