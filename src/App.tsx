import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ChecklistProvider } from '@/hooks/use-checklist'
import { Layout } from './components/Layout'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import LeadCapture from './pages/LeadCapture'
import Checklist from './pages/Checklist'
import Result from './pages/Result'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <TooltipProvider>
      <ChecklistProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/identificacao" element={<LeadCapture />} />
            <Route path="/checklist" element={<Checklist />} />
            <Route path="/resultado" element={<Result />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ChecklistProvider>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
