import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Landing from './pages/landing'
import Login from './pages/login'
import Dashboard from './pages/dashboard'
import CropAdvisor from './pages/cropAdvisor'
import DiseaseDetection from './pages/diseaseDetection'
import IrrigationPlanner from './pages/irrigationPlanner'
import WeatherIntelligence from './pages/weatherIntelligence'
import MarketInsights from './pages/marketInsights'
import FarmRecords from './pages/farmRecords'
import AdminPanel from './pages/adminPanel'
import RegenAg from './pages/regenAg'
import BricsNetwork from './pages/bricsNetwork'
import './index.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/app" element={<Layout />}>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="crop-advisor" element={<CropAdvisor />} />
        <Route path="disease-detection" element={<DiseaseDetection />} />
        <Route path="irrigation" element={<IrrigationPlanner />} />
        <Route path="weather" element={<WeatherIntelligence />} />
        <Route path="market" element={<MarketInsights />} />
        <Route path="records" element={<FarmRecords />} />
        <Route path="regen" element={<RegenAg />} />
        <Route path="brics" element={<BricsNetwork />} />
        <Route path="admin" element={<AdminPanel />} />
      </Route>
    </Routes>
  )
}

export default App
