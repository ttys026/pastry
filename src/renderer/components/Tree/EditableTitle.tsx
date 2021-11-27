import { Input } from 'antd';
import { useState } from 'react';
import { useKeyPress } from 'ahooks';

interface Props {
  value: string;
  onChange: (v: string) => void;
  width: number;
}

const SingleLineInput = ({
  value,
  onChange,
  quitEdit,
  width,
}: {
  value: string;
  onChange: (v: string) => void;
  quitEdit: () => void;
  width: number
}) => {
  useKeyPress('Enter', quitEdit);
  return (
    <Input
      size="small"
      autoFocus
      style={{ position: 'absolute', maxWidth: width }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={quitEdit}
    />
  );
};

export default (props: Props) => {
  const [mode, setMode] = useState<'display' | 'edit'>('display');
  const [value, setValue] = useState(props.value);
  return mode === 'display' ? (
    <span
      title=""
      style={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        width: props.width - 5,
        maxWidth: props.width - 5,
        display: 'table-cell',
      }}
      onDoubleClick={() =>
        setMode((v) => (v === 'display' ? 'edit' : 'display'))
      }
    >
      {value}
    </span>
  ) : (
    <SingleLineInput
      width={props.width}
      value={value}
      onChange={setValue}
      quitEdit={() => {
        setMode('display');
        props.onChange(value);
      }}
    />
  );
};
