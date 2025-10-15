
import { Routes, Route } from "react-router-dom";

import SignInPage from '../pages/shared/SignInPage';


function DesktopLayout(){

    return(
        <div>
            <h1>Desktop Layout</h1>
            <Routes>
                <Route path="/" element={<SignInPage />} />
            </Routes>
        </div>
    )
}

export default DesktopLayout;