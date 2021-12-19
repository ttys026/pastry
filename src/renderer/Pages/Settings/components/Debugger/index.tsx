import { useEffect, useRef, useState } from 'react';
import {
  CloseOutlined,
  StopOutlined,
  UpCircleOutlined,
  DownCircleOutlined,
} from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import dayjs from 'dayjs';
import Inspector from 'react-inspector';
import './index.css';

interface LogItem {
  time: string;
  type: keyof Console;
  args: any[];
}

interface Props {
  debuggerMaximized: boolean;
}

export default (props: Props) => {
  const [log, setLog] = useState<LogItem[]>([]);
  const [key, setKey] = useState(0);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const writeLog = (_, payload: { type: keyof Console; args: any[] }) => {
      setLog((d) => [
        ...d,
        {
          // @ts-ignore
          time: `${dayjs().format('HH:mm:ss')} ✗`,
          type: payload.type,
          args: payload.args,
        },
      ]);
    };
    window.ipcRenderer.on('log', writeLog);
    return () => {
      window.ipcRenderer.off('log', writeLog);
    };
  }, []);

  useEffect(() => {
    try {
      container.current.parentElement.parentElement.scrollTop =
        Number.MAX_SAFE_INTEGER;
    } catch (e) {
      console.log('error', e);
    }
  }, [log]);

  return (
    <div>
      <div
        style={{
          position: 'sticky',
          float: 'right',
          top: 0,
          margin: 0,
          backgroundColor: 'white',
          width: '100%',
          zIndex: 1,
          padding: '4px 8px',
          borderBottom: '1px solid rgba(0,0,0,0.2)',
          background: '#fafafa',
        }}
      >
        <Tooltip title="关闭">
          <Button
            style={{ float: 'right' }}
            onClick={() => window.dispatchEvent(new Event('debugger'))}
            size="small"
            type="text"
          >
            <CloseOutlined />
          </Button>
        </Tooltip>
        <Tooltip title="清空">
          <Button
            style={{ float: 'right', marginRight: 8 }}
            onClick={() => setLog([])}
            size="small"
            type="text"
          >
            <StopOutlined />
          </Button>
        </Tooltip>
        <Tooltip key={key} title="全屏">
          <Button
            style={{ float: 'right', marginRight: 8 }}
            onClick={() => {
              setKey((k) => k + 1);
              window.dispatchEvent(new Event('maximize'));
            }}
            size="small"
            type="text"
          >
            {props.debuggerMaximized ? (
              <DownCircleOutlined />
            ) : (
              <UpCircleOutlined />
            )}
          </Button>
        </Tooltip>
      </div>
      <div ref={container} style={{ fontFamily: 'monospace', zoom: 1.1 }}>
        {log.length === 0 && (
          <div
            style={{
              position: 'absolute',
              transform: 'translate(-50%, -50%)',
              top: '50%',
              left: '50%',
              fontSize: 12,
            }}
          >
            执行脚本后可在此处查看日志
          </div>
        )}
        {log.map((ele, index) => {
          const [info, payload] = ele.args;
          return (
            <div
              key={index}
              style={{
                backgroundColor:
                  { error: 'rgb(255,239,239)', warn: 'rgb(255,252,228)' }[
                    ele.type
                  ] || 'white',
              }}
              className="logItem"
            >
              <span style={{ flexShrink: 0 }}>
                {ele.time}&nbsp;{info}
              </span>
              {ele.args.length > 1 && (
                <span className="logTree">
                  {Array.isArray(payload) && payload.length ? (
                    payload.map((element, i) => (
                      <Inspector
                        table={ele.type === 'table'}
                        theme="chromeLight"
                        key={`${index}-${i}`}
                        data={element}
                      />
                    ))
                  ) : (
                    <Inspector
                      table={ele.type === 'table'}
                      theme="chromeLight"
                      key={`${index}--1`}
                      data={payload}
                    />
                  )}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
