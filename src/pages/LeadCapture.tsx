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
import { Card, CardContent } from '@/components/ui/card'
import { ShieldCheck, ArrowRight, Loader2 } from 'lucide-react'
import { upsertLead, createResposta, createScore } from '@/services/api'
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
  const { setLeadData, leadData, answers, score, questions } = useChecklist()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      nome: leadData?.nome ?? '',
      email: leadData?.email ?? '',
      telefone: leadData?.telefone ?? '',
      cartorio: leadData?.cartorio ?? '',
      cnpj: leadData?.cnpj ?? '',
      lgpd: false,
    },
  })

  const { isValid } = form.formState

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)

      const leadPayload = {
        ...(leadData?.id ? { id: leadData.id } : {}),
        nome: String(values.nome),
        email: String(values.email),
        telefone: String(values.telefone),
        cartorio: String(values.cartorio),
        cnpj: String(values.cnpj),
        status: 'novo',
        score: Number(score) || 0,
      }

      const lead = await upsertLead({
        ...leadPayload,
        respostas_json: answers,
      })

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
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 py-12 px-4 animate-fade-in min-h-screen">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8 animate-slide-down">
          <div className="inline-flex items-center justify-center p-4 bg-primary/20 rounded-full mb-6">
            <ShieldCheck className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Seu relatório de conformidade está pronto
          </h1>
          <p className="text-slate-300 mt-4 text-lg">
            Para acessar seu resultado e receber orientação de um especialista em Provimento 213,
            preencha seus dados:
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900/60 shadow-2xl animate-slide-up backdrop-blur-md">
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200">Nome Completo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: João Silva"
                          className="h-11 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <div className="grid sm:grid-cols-2 gap-5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-200">E-mail Profissional</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="contato@cartorio.com.br"
                            className="h-11 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-200">Telefone / WhatsApp</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="(11) 99999-9999"
                            className="h-11 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
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
                        <FormLabel className="text-slate-200">Nome da serventia</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="1º Tabelionato de Notas"
                            className="h-11 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cnpj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-200">CNPJ</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="00.000.000/0000-00"
                            className="h-11 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="lgpd"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border border-slate-800 rounded-lg bg-slate-900/80 mt-6">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="mt-1 border-slate-600 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium text-slate-300 leading-snug cursor-pointer">
                          Autorizo a Tiexpress Soluções a entrar em contato para apresentar soluções
                          de conformidade ao Provimento 213
                        </FormLabel>
                        <FormMessage className="text-red-400" />
                      </div>
                    </FormItem>
                  )}
                />

                <div className="pt-6">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14 text-base rounded-xl group font-semibold"
                    disabled={!isValid || isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Ver Meu Resultado
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
