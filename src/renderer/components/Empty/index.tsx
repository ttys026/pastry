// import React from 'react';

import { useKeyPress } from 'ahooks';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { message, Table, Popover } from 'antd';
import type { DataNode } from 'rc-tree/lib/interface';
import './index.css';

interface Props {
  treeData: DataNode[];
}

const columns = [
  {
    key: 'key',
    title: '变量名',
    dataIndex: 'variable',
  },
  {
    key: 'package',
    title: '包名',
    dataIndex: 'package',
    render: (value, _, index) => {
      if ([0, 2].includes(index)) {
        return {
          props: { rowSpan: 2 },
          children: value,
        };
      }
      if ([1, 3].includes(index)) {
        return {
          children: value,
          props: { rowSpan: 0 },
        };
      }
      return {
        props: { rowSpan: 1 },
        children: value,
      };
    },
  },
  {
    key: 'doc',
    title: '文档',
    dataIndex: 'doc',
    render: (value, _, index) => {
      if ([0, 2].includes(index)) {
        return {
          props: { rowSpan: 2 },
          children: (
            <a target="_blank" href={value}>
              查看
            </a>
          ),
        };
      }
      if ([1, 3].includes(index)) {
        return {
          children: (
            <a target="_blank" href={value}>
              查看
            </a>
          ),
          props: { rowSpan: 0 },
        };
      }
      return {
        props: { rowSpan: 1 },
        children: (
          <a target="_blank" href={value}>
            查看
          </a>
        ),
      };
    },
  },
];

const data = [
  {
    variable: '_',
    package: 'lodash',
    doc: 'https://lodash.com/docs',
  },
  {
    variable: 'lodash',
    package: 'lodash',
    doc: 'https://lodash.com/docs',
  },
  {
    variable: 'dayjs',
    package: 'dayjs',
    doc: 'https://day.js.org/',
  },
  {
    variable: 'moment',
    package: 'dayjs',
    doc: 'https://day.js.org/',
  },
  {
    variable: 'axios',
    package: 'axios',
    doc: 'https://axios-http.com/docs/api_intro',
  },
];

export default (props: Props) => {
  console.log(props);
  useKeyPress('meta.v', async () => {
    const text = await navigator.clipboard.readText();
    message.success(
      `你粘贴了 "${text.length > 40 ? text.slice(0, 40) + '...' : text}"`
    );
  });

  return (
    <div className="intro">
      <div style={{ width: 500 }}>
        <div>
          dough(面团)是制作Pastry(糕点)的原料，由一段 javascript
          书写的代码组成，
        </div>
        <div>你可以利用内置的工具(如：lodash、nanoid、axios)进行烹饪。</div>
        <pre className="demo">
          <span style={{ paddingRight: 0.1 }}>
            () <span className="cm-operator">=&gt;</span>{' '}
            <span className="cm-string">"Hello World"</span>
          </span>
        </pre>
        <div>上面的代码片段会在每次执行时返回 "Hello World"，</div>
        <div>
          你可以按下<span className="shortcut">Command + Shift + V</span>
          激活菜单来执行它。
        </div>
        <div>或者单独为它设置一个快捷键，从而在无需弹出菜单的情况下执行。</div>
        <div>
          利用这种方式，你可以快速完成邮箱、银行卡号、常用网址等文本的输入。
        </div>

        <div style={{ marginTop: 16 }}>
          除此之外，你还可以实现更复杂的效果：
        </div>

        <pre className="demo">
          <span>
            (<span className="cm-def">selection</span>){' '}
            <span className="cm-operator">=&gt;</span>{' '}
            <span className="cm-string">`Hello ${'{'}</span>
            <span className="cm-variable">selection</span>
            <span className="cm-string">{'}'}</span>
            <span className="cm-string">@${'{'}</span>
            <span className="cm-variable">dayjs</span>.
            <span className="cm-property">format</span>()
            <span className="cm-string">{'}'}`</span>
          </span>
        </pre>

        <div>
          上面的代码中，函数的入参 <span className="shortcut">selection</span>
          存储了当前选中的文本内容
        </div>
        <div>dayjs 则是一个内置的模块，它可以用来处理时间相关的运算。</div>
        <div style={{ margin: '16px 0' }}>
          所有内置的模块在编辑器中都拥有 TS 类型提示，下面是完整的内置模块列表：
        </div>
        <div>
          <Table
            size="small"
            rowKey="key"
            pagination={false}
            bordered
            columns={columns}
            dataSource={data}
          />
        </div>
        <div style={{ margin: '16px 0' }}>
          除了<span className="shortcut">selection</span>
          外，函数还有另外两个入参，分别是剪贴板的历史记录和当前触发粘贴的 app
        </div>
        <div>
          <Table
            size="small"
            rowKey="key"
            pagination={false}
            bordered
            columns={[
              { key: 0, title: '参数序列', dataIndex: 'order' },
              { key: 1, title: '变量内容', dataIndex: 'content' },
            ]}
            dataSource={[
              {
                order: 'args[0]',
                content: (
                  <>
                    当前选中的文本内容
                    <Popover
                      // @ts-ignore
                      getPopupContainer={(p) => p?.parentNode}
                      overlayInnerStyle={{
                        wordBreak: 'break-all',
                        maxWidth: 300,
                      }}
                      content="函数执行前会使用 Command + C 触发复制行为来获取当前选中内容，部分编辑器(如: VS Code) 在未选中任何内容时，会粘贴当前行的内容(包含最后的换行符)至剪贴板，可以使用第三个参数针对特殊应用单独处理"
                    >
                      <span className="extra"><QuestionCircleOutlined /></span>
                    </Popover>
                  </>
                ),
              },
              {
                order: 'args[1]',
                content: '剪贴板历史',
              },
              {
                order: 'args[2]',
                content: (
                  <>
                    触发粘贴操作 App 的完整路径
                    <Popover
                      // @ts-ignore
                      getPopupContainer={(p) => p?.parentNode}
                      overlayInnerStyle={{
                        wordBreak: 'break-all',
                        maxWidth: 300,
                      }}
                      content="获取的路径为当前聚焦且位于最上层的应用"
                    >
                      <span className="extra"><QuestionCircleOutlined /></span>
                    </Popover>
                  </>
                ),
              },
            ]}
          />
        </div>
        <div style={{ marginTop: 16 }}>
          了解了这些信息后，你可以新建一个文件，开始在编写你自己的脚本了。
        </div>
      </div>
    </div>
  );
};
