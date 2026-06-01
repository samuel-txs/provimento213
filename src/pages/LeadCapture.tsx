import { useState } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { ShieldCheck, ArrowRight, Loader2 } from 'lucide-react'
import { createLead, createResposta, createScore } from '@/services/api'
import { toast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/lib/pocketbase/errors'

const formSchema = z.object({
  nome: z.string().min(3, 'Mínimo de 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  telefone: z.string().min(10, 'Número inválido'),
  cartorio: z.string().min(3, 'Mínimo de 3 caracteres'),
  cnpj: z.string().min(14, 'CNPJ inválido'),
  lgpd: z.boolean().refine((val) => val === true, {
    message: 'Você deve aceitar os termos para continuar.',
  }),
})

export default function LeadCapture() {
  const navigate = useNavigate()
  const { setLeadData, answers, score, questions } = useChecklist()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      cartorio: '',
      cnpj: '',
      lgpd: false,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)

      const leadPayload = {
        nome: String(values.nome),
        email: String(values.email),
        telefone: String(values.telefone),
        cartorio: String(values.cartorio),
        cnpj: String(values.cnpj),
        status: 'novo',
        score: Number(score) || 0,
      }

      const lead = await createLead(leadPayload)

      // Save answers
      const resPromises = Object.entries(answers).map(([qId, answer]) => {
        const question = questions.find((q) => q.id === qId)
        if (!question) return Promise.resolve()
        return createResposta({
          lead_id: lead.id,
          pergunta_id: String(question.id),
          resposta: String(answer),
          categoria: String(question.categoria),
        })
      })
      await Promise.all(resPromises)

      // Save score
      await createScore({
        lead_id: lead.id,
        score_total: Number(score) || 0,
      })

      setLeadData(values)
      toast({
        title: 'Sucesso!',
        description: 'Seus resultados foram gerados com sucesso.',
      })
      navigate('/resultado')
    } catch (err) {
      console.error(err)
      toast({
        title: 'Erro no cadastro',
        description:
          getErrorMessage(err) || 'Verifique se os dados estão corretos e tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-muted/30 py-12 px-4 animate-fade-in">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8 animate-slide-down">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Falta Pouco!</h1>
          <p className="text-slate-500 mt-2">
            Preencha seus dados profissionais para liberar o seu Relatório de Conformidade.
          </p>
        </div>

        <Card className="border-none shadow-elevation animate-slide-up">
          <CardHeader className="pb-4">
            <CardTitle>Dados de Contato</CardTitle>
            <CardDescription>
              Seu relatório será gerado imediatamente após o preenchimento.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: João Silva" className="h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid sm:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail Profissional</FormLabel>
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
                    name="telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone / WhatsApp</FormLabel>
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
                <div className="grid sm:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="cartorio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Cartório</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="1º Tabelionato de Notas"
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
                    name="cnpj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CNPJ</FormLabel>
                        <FormControl>
                          <Input placeholder="00.000.000/0000-00" className="h-11" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="lgpd"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-lg bg-slate-50">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-1"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium text-slate-700 leading-snug">
                          Autorizo a Tiexpress Soluções a entrar em contato para apresentar soluções
                          de conformidade ao Provimento 213.
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14 text-base rounded-xl group"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Ver Resultados{' '}
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
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
