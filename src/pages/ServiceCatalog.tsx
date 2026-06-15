import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Shield,
  Network,
  Database,
  Server,
  FileCheck,
  HeadphonesIcon,
  CheckCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import pb from '@/lib/pocketbase/client'

const SERVICES = [
  {
    id: 'redes',
    title: 'Redes e Conectividade',
    description: 'Redundância de links e segurança de perímetro',
    icon: Network,
    items: [
      'Implementação de links de internet de provedores distintos',
      'Configuração de firewall físico e lógico (SonicWall, Fortinet)',
      'VPN corporativa para acesso remoto seguro',
      'Segmentação de rede (DMZ, VLANs, separação de ambientes)',
    ],
  },
  {
    id: 'seguranca',
    title: 'Segurança de Dados e Endpoint',
    description: 'Proteção contra ameaças e controle de acesso',
    icon: Shield,
    items: [
      'Instalação de antivírus e EDR em todas as máquinas (Acronis, Bitdefender)',
      'Monitoramento proativo de segurança (24/7 via N-able RMM)',
      'Gestão de políticas de senha e MFA (autenticação multifator)',
      'Relatórios de conformidade e gestão de vulnerabilidades',
    ],
  },
  {
    id: 'backup',
    title: 'Backup e Recuperação',
    description: 'Continuidade operacional e recuperação de desastres',
    icon: Database,
    items: [
      'Backup em nuvem e local com criptografia AES-256',
      'Testes periódicos de restore e validação de integridade',
      'Backup Microsoft 365 (email, SharePoint, OneDrive)',
      'Plano de contingência e RTO/RPO definidos',
    ],
  },
  {
    id: 'infraestrutura',
    title: 'Infraestrutura e Energia',
    description: 'Estabilidade física e ambiental',
    icon: Server,
    items: [
      'Dimensionamento e instalação de nobreaks para servidores',
      'Monitoramento de temperatura, umidade e energia do datacenter',
      'Virtualização de servidores (Hyper-V, VMware)',
      'Manutenção preventiva de hardware crítico',
    ],
  },
  {
    id: 'governanca',
    title: 'Governança e Compliance',
    description: 'Documentação e gestão de riscos',
    icon: FileCheck,
    items: [
      'Elaboração de políticas de segurança da informação',
      'Gestão de logs de acesso e auditoria (SIEM)',
      'Inventário de ativos de TI e classificação de dados',
      'Consultoria para adequação à LGPD e Provimento 213',
    ],
  },
  {
    id: 'suporte',
    title: 'Suporte e Monitoramento',
    description: 'Operação de TI contínua',
    icon: HeadphonesIcon,
    items: [
      'RMM de primeira linha com monitoramento em tempo real',
      'Suporte técnico ágil com equipe especializada',
      'Automação de tarefas e scripts de manutenção',
      'Relatórios de eficiência e SLA mensal',
    ],
  },
]

export default function ServiceCatalog() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cartorio: '',
    cnpj: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const serviceName = SERVICES.find((s) => s.id === selectedService)?.title || selectedService

      const leadData = {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        cartorio: formData.cartorio,
        cnpj: formData.cnpj || 'Não informado',
        status: 'novo',
        notas: `Solicitou proposta para o serviço: ${serviceName}`,
      }

      await pb.collection('leads').create(leadData)
      toast.success('Solicitação enviada com sucesso!', {
        description: 'Nossa equipe entrará em contato em breve.',
      })
      setIsModalOpen(false)
      setFormData({ nome: '', email: '', telefone: '', cartorio: '', cnpj: '' })
    } catch (error: any) {
      toast.error('Erro ao enviar solicitação', {
        description: 'Por favor, verifique os dados ou tente novamente.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const openModalForService = (serviceId: string) => {
    setSelectedService(serviceId)
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 py-20 px-4 sm:px-6 lg:px-8 font-sans selection:bg-orange-500/30 selection:text-orange-200">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-6 tracking-tight leading-tight">
            Serviços Tiexpress para <br className="hidden sm:block" />
            Adequação ao <span className="text-orange-500 font-normal">Provimento 213</span>
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-orange-600 to-orange-400 mx-auto rounded-full mb-8" />
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed">
            Cada exigência do CNJ tem uma solução técnica por trás. Veja como podemos adequar sua
            serventia com serviços especializados e infraestrutura robusta:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES.map((service) => (
            <Card
              key={service.id}
              className="bg-slate-900 border-slate-800 text-slate-200 flex flex-col h-full shadow-2xl hover:border-orange-500/50 transition-colors duration-300 group"
            >
              <CardHeader className="pb-5 border-b border-slate-800/80">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3.5 bg-orange-500/10 rounded-xl text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
                    <service.icon className="w-7 h-7" />
                  </div>
                  <CardTitle className="text-xl font-medium text-slate-100 leading-snug">
                    {service.title}
                  </CardTitle>
                </div>
                <CardDescription className="text-slate-400 text-base font-light">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 flex-grow">
                <ul className="space-y-4">
                  {service.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-300 font-light leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pt-6 border-t border-slate-800/80">
                <Button
                  onClick={() => openModalForService(service.id)}
                  className="w-full bg-orange-600 hover:bg-orange-500 text-white font-medium py-6 text-base transition-all duration-300 shadow-lg shadow-orange-900/20"
                >
                  Solicitar Proposta
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800 text-slate-100 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white font-light tracking-tight">
              Solicitar Proposta
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-light mt-2">
              Preencha os dados abaixo e nossa equipe comercial entrará em contato com uma proposta
              técnica personalizada.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-slate-300 font-normal">
                Nome completo
              </Label>
              <Input
                id="nome"
                name="nome"
                required
                value={formData.nome}
                onChange={handleChange}
                className="bg-slate-950 border-slate-700 text-white focus-visible:ring-orange-500"
                placeholder="Seu nome"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300 font-normal">
                  E-mail corporativo
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-slate-950 border-slate-700 text-white focus-visible:ring-orange-500"
                  placeholder="email@cartorio.com.br"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone" className="text-slate-300 font-normal">
                  Telefone / WhatsApp
                </Label>
                <Input
                  id="telefone"
                  name="telefone"
                  required
                  value={formData.telefone}
                  onChange={handleChange}
                  className="bg-slate-950 border-slate-700 text-white focus-visible:ring-orange-500"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cartorio" className="text-slate-300 font-normal">
                Nome da serventia
              </Label>
              <Input
                id="cartorio"
                name="cartorio"
                required
                value={formData.cartorio}
                onChange={handleChange}
                className="bg-slate-950 border-slate-700 text-white focus-visible:ring-orange-500"
                placeholder="Ex: 1º Ofício de Notas"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnpj" className="text-slate-300 font-normal">
                CNPJ <span className="text-slate-500 text-sm">(opcional)</span>
              </Label>
              <Input
                id="cnpj"
                name="cnpj"
                value={formData.cnpj}
                onChange={handleChange}
                className="bg-slate-950 border-slate-700 text-white focus-visible:ring-orange-500"
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="servico" className="text-slate-300 font-normal">
                Serviço de interesse principal
              </Label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger className="bg-slate-950 border-slate-700 text-white focus-visible:ring-orange-500">
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                  {SERVICES.map((s) => (
                    <SelectItem
                      key={s.id}
                      value={s.id}
                      className="focus:bg-slate-800 focus:text-white"
                    >
                      {s.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="pt-4 border-t border-slate-800">
              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-500 text-white py-6 text-base font-medium transition-colors duration-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enviando solicitação...' : 'Enviar Solicitação de Proposta'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
