import { useState } from 'react';

export default function App() {
  const [state] = useState('hello worold');
  return <div>{state}</div>;
}
