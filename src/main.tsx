import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import HomePage from './pages/HomePage';
import './index.css';

// 페이지는 홈 하나뿐이다. 라우팅 없이 바로 렌더한다.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HomePage />
  </StrictMode>,
);
