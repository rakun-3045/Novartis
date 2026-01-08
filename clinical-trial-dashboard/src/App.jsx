import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Studies from './pages/Studies'
import StudyDetail from './pages/StudyDetail'
import Sites from './pages/Sites'
import Subjects from './pages/Subjects'
import Analytics from './pages/Analytics'
import Chat from './pages/Chat'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/studies" element={<Studies />} />
        <Route path="/studies/:studyId" element={<StudyDetail />} />
        <Route path="/sites" element={<Sites />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Layout>
  )
}

export default App
