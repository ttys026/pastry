import { render } from 'react-dom';
import Settings from './Pages/Settings';
import Search from './Pages/Search';

const isSetting = window.location.search.includes('setting')

render(isSetting ? <Settings /> : <Search />, document.getElementById('root'));
