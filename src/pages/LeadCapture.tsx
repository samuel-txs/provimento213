import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { useNavigate } from 'react-router-dom'
import { useChecklist } from '@/hooks/use-checklist'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { ShieldCheck, ArrowRight } from 'lucide-react'

const formSchema = z.object({
  nomeServentia: z.string().min(3, 'Mínimo de 3 caracteres'),
  responsavel: z.string().min(3, 'Mínimo de 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  whatsapp: z.string().min(10, 'Número inválido, inclua o DDD'),
  uf: z.string().length(2, 'Digite a sigla do estado, ex: SP').toUpperCase(),
})

export default function LeadCapture() {
  const navigate = useNavigate()
  const { setLeadData, reset } = useChecklist()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nomeServentia: '',
      responsavel: '',
      email: '',
      whatsapp: '',
      uf: '',
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    reset() // Clear any previous answers
    setLeadData(values)
    navigate('/checklist')
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-muted/30 py-12 px-4 animate-fade-in">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8 animate-slide-down">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Identificação da Serventia
          </h1>
          <p className="text-slate-500 mt-2">
            Preencha os dados abaixo para iniciar o checklist e receber seu relatório de
            conformidade.
          </p>
        </div>

        <Card className="border-none shadow-elevation animate-slide-up">
          <CardHeader className="pb-4">
            <CardTitle>Dados de Contato</CardTitle>
            <CardDescription>
              As informações serão usadas apenas para gerar o relatório final.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="nomeServentia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Serventia (Cartório)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: 1º Tabelionato de Notas de São Paulo"
                          className="h-11"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid sm:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="responsavel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Responsável (TI ou Titular)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: João Silva" className="h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="uf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado (UF)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: SP"
                            className="h-11 uppercase"
                            maxLength={2}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail Corporativo</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="contato@cartorio.com.br"
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="whatsapp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp (com DDD)</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="(11) 99999-9999"
                            className="h-11"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14 text-base rounded-xl group"
                  >
                    Iniciar Checklist
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
