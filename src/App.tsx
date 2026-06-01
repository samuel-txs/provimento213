import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'
import { ChecklistProvider } from '@/hooks/use-checklist'
import { CartProvider } from '@/hooks/use-cart'
import { Layout } from './components/Layout'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import LeadCapture from './pages/LeadCapture'
import Checklist from './pages/Checklist'
import Result from './pages/Result'
import ServiceCatalog from './pages/ServiceCatalog'
import Cart from './pages/Cart'
import ProposalSummary from './pages/ProposalSummary'
import AdminDashboard from './pages/admin/AdminDashboard'
import CrmLayout from './pages/crm/CrmLayout'
import AdminServices from './pages/crm/AdminServices'
import Dashboard from './pages/crm/Dashboard'
import VendedorLogin from './pages/crm/VendedorLogin'
import LeadDetail from './pages/crm/LeadDetail'
import MeusLeads from './pages/crm/MeusLeads'
import Propostas from './pages/crm/Propostas'
import AccessDenied from './pages/crm/AccessDenied'
import ChecklistManagement from './pages/crm/gestao/ChecklistManagement'
import SettingsManagement from './pages/crm/gestao/SettingsManagement'
import { ConfigProvider } from './hooks/use-configuracoes'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <AuthProvider>
      <TooltipProvider>
        <ChecklistProvider>
          <CartProvider>
            <ConfigProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/identificacao" element={<LeadCapture />} />
                  <Route path="/checklist" element={<Checklist />} />
                  <Route path="/resultado" element={<Result />} />
                  <Route path="/servicos" element={<ServiceCatalog />} />
                  <Route path="/carrinho" element={<Cart />} />
                  <Route path="/proposta" element={<ProposalSummary />} />
                </Route>

                {/* CRM Routes */}
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/vendedor/login" element={<VendedorLogin />} />
                <Route path="/crm/acesso-negado" element={<AccessDenied />} />
                <Route path="/crm" element={<CrmLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="leads" element={<MeusLeads />} />
                  <Route path="leads/:id" element={<LeadDetail />} />
                  <Route path="propostas" element={<Propostas />} />
                  <Route path="servicos" element={<AdminServices />} />
                  <Route path="gestao/checklist" element={<ChecklistManagement />} />
                  <Route path="gestao/configuracoes" element={<SettingsManagement />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </ConfigProvider>
          </CartProvider>
        </ChecklistProvider>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
