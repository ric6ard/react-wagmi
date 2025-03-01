import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Test from './pages/Test';
import WatchUsdt from './pages/WatchUsdt';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/test" element={<Test />} />
        <Route path="/watchusdt" element={<WatchUsdt />} />
        {/* 其他路由 */}
      </Routes>
    </Router>
  );
};

export default App;