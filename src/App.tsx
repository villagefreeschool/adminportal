import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

// Components
import Layout from './components/Layout';

// Pages
import Home from './pages/Home';
import MyFamily from './pages/MyFamily';
import FamilyList from './pages/FamilyList';
import YearList from './pages/YearList';
import Users from './pages/Users';

function App() {
  return (
    <BrowserRouter>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/my-family" element={<MyFamily />} />
            <Route path="/families" element={<FamilyList />} />
            <Route path="/years" element={<YearList />} />
            <Route path="/users" element={<Users />} />
          </Routes>
        </Layout>
      </Box>
    </BrowserRouter>
  );
}

export default App;
