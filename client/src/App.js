import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { DataProvider } from './GlobalState'
import { ToastContainer } from 'react-toastify';
import { GoogleOAuthProvider } from '@react-oauth/google';
import 'react-toastify/dist/ReactToastify.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import BttopBtn from './components/mainpages/utils/bttopBtn/BttopBtn'
import Content from './Content'

function App() {
  return (
    <GoogleOAuthProvider clientId="711887640793-m0i8nt5fjdidt4urjpio2jpd88suip6n.apps.googleusercontent.com">
      <DataProvider>
        <Router>
          <div className="App">
            <Content></Content>
            <ToastContainer />
            <BttopBtn />
          </div>
        </Router>
      </DataProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
