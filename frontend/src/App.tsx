import './App.css'
import Chat from './pages/Chat';
import Landing from './pages/Landing';

import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";


function App() {
  return (
    <div style={{width: '100vw',height: '100vh'}}>
      <div style={{width: '100%',height: '100%',marginLeft:'auto',marginRight: 'auto', boxSizing: 'border-box',padding: '1rem 2rem 0rem 2rem',/*border: 'solid red',borderRadius: '5rem'*/}}> 
          <BrowserRouter>
            <Routes>
              <Route path='/' element={<Navigate to='/landing'/>}/>
              <Route path='/landing' element={<Landing/>}/>
              <Route path='/home' element={<Chat/>}/>
            </Routes>
          </BrowserRouter>
          {/*<h1>CHATTO</h1>*/}
      </div>
    </div>
  )
}

export default App;

