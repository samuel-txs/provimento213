import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useConfiguracoes, hexToHsl } from '@/hooks/use-configuracoes'
import pb from '@/lib/pocketbase/client'
import { toast } from 'sonner'
import { Loader2, Save, MonitorPlay, Copy } from 'lucide-react'

export default function SettingsManagement() {
  const { configs, loading } = useConfiguracoes()
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!loading) {
      setFormData({
        nome_empresa: configs['nome_empresa'] || '',
        logo_url: configs['logo_url'] || '',
        email_contato: configs['email_contato'] || '',
        telefone: configs['telefone'] || '',
        endereco: configs['endereco'] || '',
        cor_primaria: configs['cor_primaria'] || '#eb5e28',
        cor_secundaria: configs['cor_secundaria'] || '#0fb781',
        mensagem_boas_vindas: configs['mensagem_boas_vindas'] || '',
        mensagem_sucesso: configs['mensagem_sucesso'] || '',
        termos_consentimento: configs['termos_consentimento'] || '',
        email_diagnostico_ativo: configs['email_diagnostico_ativo'] || 'true',
        email_diagnostico_assunto:
          configs['email_diagnostico_assunto'] ||
          'Seu Resultado de Conformidade Provimento 213 - Tiexpress',
        email_diagnostico_corpo: configs['email_diagnostico_corpo'] || '',
        email_diagnostico_destinatarios: configs['email_diagnostico_destinatarios'] || '',
        email_diagnostico_anexar_pdf: configs['email_diagnostico_anexar_pdf'] || 'false',
      })
    }
  }, [configs, loading])

  const handleChange = (k: string, v: string) => setFormData((p) => ({ ...p, [k]: v }))

  const handleSave = async () => {
    if (formData.email_diagnostico_destinatarios) {
      const emails = formData.email_diagnostico_destinatarios
        .split(',')
        .map((e) => e.trim())
        .filter((e) => e)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const invalidEmails = emails.filter((e) => !emailRegex.test(e))
      if (invalidEmails.length > 0) {
        toast.error(`E-mail(s) inválido(s): ${invalidEmails.join(', ')}`)
        return
      }
    }

    setSaving(true)
    try {
      const records = await pb.collection('configuracoes_plataforma').getFullList()
      const recordMap = new Map(records.map((r) => [r.chave, r.id]))

      for (const [key, val] of Object.entries(formData)) {
        if (configs[key] !== val) {
          const id = recordMap.get(key)
          if (id) {
            await pb.collection('configuracoes_plataforma').update(id, { valor: val })
          } else {
            await pb.collection('configuracoes_plataforma').create({ chave: key, valor: val })
          }
        }
      }
      toast.success('Configurações atualizadas com sucesso!')
    } catch (e) {
      console.error(e)
      toast.error('Erro ao salvar as configurações.')
    } finally {
      setSaving(false)
    }
  }

  const copyPlaceholder = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`Variável ${text} copiada!`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Configurações do Sistema</h2>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Salvar Configurações
        </Button>
      </div>

      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList className="bg-slate-900 border border-slate-800">
          <TabsTrigger value="geral" className="data-[state=active]:bg-slate-800 text-slate-300">
            Geral e Tema
          </TabsTrigger>
          <TabsTrigger value="emails" className="data-[state=active]:bg-slate-800 text-slate-300">
            Automação de E-mails
          </TabsTrigger>
        </TabsList>

        <TabsContent value="geral">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-8">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
                <h3 className="text-lg font-semibold text-white border-b border-slate-800 pb-2">
                  Identidade e Contato
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Nome da Empresa</Label>
                    <Input
                      value={formData.nome_empresa || ''}
                      onChange={(e) => handleChange('nome_empresa', e.target.value)}
                      className="bg-slate-950 border-slate-800 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">URL da Logo (Opcional)</Label>
                    <Input
                      value={formData.logo_url || ''}
                      onChange={(e) => handleChange('logo_url', e.target.value)}
                      placeholder="https://exemplo.com/logo.png"
                      className="bg-slate-950 border-slate-800 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Email de Contato</Label>
                      <Input
                        value={formData.email_contato || ''}
                        onChange={(e) => handleChange('email_contato', e.target.value)}
                        className="bg-slate-950 border-slate-800 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Telefone / WhatsApp</Label>
                      <Input
                        value={formData.telefone || ''}
                        onChange={(e) => handleChange('telefone', e.target.value)}
                        className="bg-slate-950 border-slate-800 text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Endereço (Rodapé)</Label>
                    <Input
                      value={formData.endereco || ''}
                      onChange={(e) => handleChange('endereco', e.target.value)}
                      className="bg-slate-950 border-slate-800 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
                <h3 className="text-lg font-semibold text-white border-b border-slate-800 pb-2">
                  Identidade Visual (Cores)
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Cor Primária</Label>
                    <div className="flex gap-3">
                      <Input
                        type="color"
                        value={formData.cor_primaria || '#eb5e28'}
                        onChange={(e) => handleChange('cor_primaria', e.target.value)}
                        className="w-14 h-10 p-1 bg-slate-950 border-slate-800 cursor-pointer rounded-md"
                      />
                      <Input
                        value={formData.cor_primaria || '#eb5e28'}
                        onChange={(e) => handleChange('cor_primaria', e.target.value)}
                        className="bg-slate-950 border-slate-800 font-mono uppercase text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Cor Secundária</Label>
                    <div className="flex gap-3">
                      <Input
                        type="color"
                        value={formData.cor_secundaria || '#0fb781'}
                        onChange={(e) => handleChange('cor_secundaria', e.target.value)}
                        className="w-14 h-10 p-1 bg-slate-950 border-slate-800 cursor-pointer rounded-md"
                      />
                      <Input
                        value={formData.cor_secundaria || '#0fb781'}
                        onChange={(e) => handleChange('cor_secundaria', e.target.value)}
                        className="bg-slate-950 border-slate-800 font-mono uppercase text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
                <h3 className="text-lg font-semibold text-white border-b border-slate-800 pb-2">
                  Textos e Mensagens
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Título de Boas-vindas (Hero)</Label>
                    <Textarea
                      value={formData.mensagem_boas_vindas || ''}
                      onChange={(e) => handleChange('mensagem_boas_vindas', e.target.value)}
                      className="bg-slate-950 border-slate-800 min-h-[80px] text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Mensagem de Sucesso (Fim do Checklist)</Label>
                    <Textarea
                      value={formData.mensagem_sucesso || ''}
                      onChange={(e) => handleChange('mensagem_sucesso', e.target.value)}
                      className="bg-slate-950 border-slate-800 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Termos de Consentimento (LGPD)</Label>
                    <Textarea
                      value={formData.termos_consentimento || ''}
                      onChange={(e) => handleChange('termos_consentimento', e.target.value)}
                      className="bg-slate-950 border-slate-800 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Live Preview */}
            <div className="hidden lg:block sticky top-24">
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-xl">
                <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center gap-2 text-sm font-medium text-slate-400">
                  <MonitorPlay className="w-4 h-4" /> Preview
                </div>
                <div
                  className="bg-[#f8fafc] flex-1 relative min-h-[500px]"
                  style={
                    {
                      '--primary': hexToHsl(formData.cor_primaria || '#eb5e28'),
                      '--secondary': hexToHsl(formData.cor_secundaria || '#0fb781'),
                    } as any
                  }
                >
                  <div className="absolute inset-0 p-6 pointer-events-none flex flex-col font-sans">
                    {/* Header Mock */}
                    <div className="flex items-center justify-between mb-16">
                      <div className="flex items-center gap-2">
                        {formData.logo_url ? (
                          <img src={formData.logo_url} alt="Logo" className="h-6 object-contain" />
                        ) : (
                          <div className="text-xl font-bold text-slate-900">
                            {formData.nome_empresa || 'Empresa'}
                          </div>
                        )}
                      </div>
                      <div className="px-4 py-1.5 bg-[hsl(var(--primary))] text-white rounded-full text-xs font-semibold shadow-sm">
                        Acessar
                      </div>
                    </div>

                    {/* Hero Mock */}
                    <div className="text-center max-w-sm mx-auto mb-10 flex-1">
                      <h1 className="text-2xl font-extrabold text-slate-900 leading-tight mb-4 whitespace-pre-wrap">
                        {formData.mensagem_boas_vindas || 'Sua mensagem de boas-vindas aqui.'}
                      </h1>
                      <p className="text-sm text-slate-500 mb-6">
                        Realize agora um diagnóstico gratuito da sua infraestrutura de TI com a{' '}
                        {formData.nome_empresa || 'Empresa'}.
                      </p>
                      <div className="h-10 px-6 inline-flex items-center justify-center bg-[hsl(var(--primary))] text-white rounded-full text-sm font-medium shadow-md">
                        Iniciar Diagnóstico Gratuito
                      </div>
                    </div>

                    {/* Footer Mock */}
                    <div className="mt-auto pt-6 border-t border-slate-200 text-center">
                      <div className="text-[11px] font-medium text-slate-600 mb-1">
                        {formData.email_contato} • {formData.telefone}
                      </div>
                      <div className="text-[11px] text-slate-500 mb-3">{formData.endereco}</div>
                      <div className="text-[9px] text-slate-400 bg-slate-100 p-2 rounded leading-tight">
                        {formData.termos_consentimento || 'Termos de consentimento...'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="emails">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-8 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  E-mail de Resultado de Diagnóstico
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Configuração do e-mail enviado automaticamente ao finalizar o checklist.
                </p>
              </div>
              <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
                <Switch
                  checked={formData.email_diagnostico_ativo === 'true'}
                  onCheckedChange={(c) =>
                    handleChange('email_diagnostico_ativo', c ? 'true' : 'false')
                  }
                />
                <Label className="text-white font-medium cursor-pointer">
                  {formData.email_diagnostico_ativo === 'true' ? 'Ativado' : 'Desativado'}
                </Label>
              </div>
            </div>

            <div
              className={
                formData.email_diagnostico_ativo !== 'true'
                  ? 'opacity-50 pointer-events-none transition-opacity'
                  : 'transition-opacity'
              }
            >
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Campos do Email */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Destinatários Adicionais (Opcional)</Label>
                    <Input
                      placeholder="admin@empresa.com, gerente@empresa.com"
                      value={formData.email_diagnostico_destinatarios || ''}
                      onChange={(e) =>
                        handleChange('email_diagnostico_destinatarios', e.target.value)
                      }
                      className="bg-slate-950 border-slate-800 text-white"
                    />
                    <p className="text-xs text-slate-500">
                      O lead sempre receberá o e-mail. Separe múltiplos e-mails por vírgula.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Assunto do E-mail</Label>
                    <Input
                      value={formData.email_diagnostico_assunto || ''}
                      onChange={(e) => handleChange('email_diagnostico_assunto', e.target.value)}
                      className="bg-slate-950 border-slate-800 text-white"
                      placeholder="Resultado do Diagnóstico Provimento 213 - {lead_cartorio}"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Corpo do E-mail (Texto ou HTML Livre)</Label>
                    <Textarea
                      value={formData.email_diagnostico_corpo || ''}
                      onChange={(e) => handleChange('email_diagnostico_corpo', e.target.value)}
                      className="bg-slate-950 border-slate-800 min-h-[250px] text-white font-mono text-sm"
                      placeholder="Deixe em branco para usar o layout padrão, ou escreva sua própria mensagem com variáveis."
                    />
                    <p className="text-xs text-slate-500">
                      Dica: Se deixar em branco, o sistema usará um template HTML moderno padrão com
                      a listagem das recomendações.
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-lg">
                    <div className="space-y-1">
                      <Label className="text-slate-300">Anexar Relatório em PDF</Label>
                      <p className="text-xs text-slate-500">
                        O resultado do diagnóstico será gerado como PDF e enviado como anexo.
                      </p>
                    </div>
                    <Switch
                      checked={formData.email_diagnostico_anexar_pdf === 'true'}
                      onCheckedChange={(c) =>
                        handleChange('email_diagnostico_anexar_pdf', c ? 'true' : 'false')
                      }
                    />
                  </div>
                </div>

                {/* Variáveis e Dicas */}
                <div className="space-y-6">
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-5">
                    <h4 className="text-sm font-semibold text-white mb-4">Variáveis Dinâmicas</h4>
                    <p className="text-xs text-slate-400 mb-4">
                      Clique em uma variável para copiar e colar no assunto ou corpo do e-mail.
                    </p>

                    <div className="space-y-3">
                      {[
                        { key: '{lead_nome}', desc: 'Nome do responsável' },
                        { key: '{lead_cartorio}', desc: 'Nome da serventia' },
                        { key: '{score_total}', desc: 'Pontuação final (%)' },
                        { key: '{data_diagnostico}', desc: 'Data do preenchimento' },
                      ].map((v) => (
                        <button
                          key={v.key}
                          type="button"
                          onClick={() => copyPlaceholder(v.key)}
                          className="w-full text-left group flex flex-col p-3 rounded bg-slate-900 border border-slate-800 hover:border-primary/50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <code className="text-sm text-primary font-bold">{v.key}</code>
                            <Copy className="w-3.5 h-3.5 text-slate-500 group-hover:text-primary transition-colors" />
                          </div>
                          <span className="text-xs text-slate-400">{v.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
