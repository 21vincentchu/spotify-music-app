import { Routes, Route } from "react-router-dom";

import SignInPage from '../pages/shared/SignInPage';

function MobileLayout() {
  return (
    <div>
        <h1>Mobile Layout</h1>
        <Routes>
            <Route path="/" element={<SignInPage />} />
        </Routes>
    </div>
  )
}

export default MobileLayout;