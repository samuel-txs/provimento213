import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChecklist, AnswerValue } from '@/hooks/use-checklist'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import logoImg from '@/assets/logo-fundopreto-ti-express-tagline-5e290.png'
import { useConfiguracoes } from '@/hooks/use-configuracoes'

export default function Checklist() {
  const navigate = useNavigate()
  const { answers, setAnswer, questions, loadingQuestions } = useChecklist()
  const { configs } = useConfiguracoes()
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentCategoryIndex])

  const categories = useMemo(() => {
    const cats = new Set(questions.map((q) => q.categoria))
    return Array.from(cats)
  }, [questions])

  if (loadingQuestions) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (categories.length === 0) {
    return <div className="p-8 text-center">Nenhuma pergunta encontrada.</div>
  }

  const currentCategory = categories[currentCategoryIndex]
  const currentQuestions = questions.filter((q) => q.categoria === currentCategory)
  const isLastCategory = currentCategoryIndex === categories.length - 1
  const isCategoryComplete = currentQuestions.every((q) => answers[q.id])

  const totalQuestions = questions.length
  const answeredQuestions = Object.keys(answers).length
  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0

  const handleNext = () => {
    if (isLastCategory) {
      navigate('/identificacao')
    } else {
      setCurrentCategoryIndex((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    setCurrentCategoryIndex((prev) => prev - 1)
  }

  return (
    <div className="flex-1 bg-muted/20 py-8 px-4 animate-fade-in">
      <div className="container max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex flex-col items-center justify-center bg-black p-4 rounded-xl shadow-lg">
            {configs['logo_url'] ? (
              <img
                src={configs['logo_url']}
                alt={configs['nome_empresa'] || 'Logo'}
                className="h-8 md:h-10 object-contain"
              />
            ) : (
              <img src={logoImg} alt="Provimento 213 TXS" className="h-8 md:h-10 object-contain" />
            )}
          </div>
        </div>

        <div className="mb-8 sticky top-20 z-10 bg-background/95 backdrop-blur p-4 rounded-xl shadow-sm border">
          <div className="flex justify-between text-sm font-medium mb-3 text-slate-600">
            <span>Progresso Geral</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2.5" />

          {/* Tabs UI */}
          <div className="flex space-x-2 overflow-x-auto mt-6 pb-2 scrollbar-hide">
            {categories.map((cat, idx) => {
              const catQuestions = questions.filter((q) => q.categoria === cat)
              const isCatComplete = catQuestions.every((q) => answers[q.id])
              const isActive = idx === currentCategoryIndex

              return (
                <button
                  key={cat}
                  onClick={() => setCurrentCategoryIndex(idx)}
                  className={cn(
                    'whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors border',
                    isActive
                      ? 'bg-primary text-primary-foreground border-primary'
                      : isCatComplete
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200',
                  )}
                >
                  {cat} {isCatComplete && <CheckCircle2 className="inline-block ml-1 h-3 w-3" />}
                </button>
              )
            })}
          </div>
        </div>

        <Card className="border-none shadow-elevation animate-slide-up">
          <CardHeader className="bg-primary text-primary-foreground rounded-t-xl pb-6">
            <CardTitle className="text-2xl">{currentCategory}</CardTitle>
            <CardDescription className="text-primary-foreground/80 text-base mt-2">
              Responda às questões referentes à categoria de {currentCategory}.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {currentQuestions.map((q, index) => (
                <div
                  key={q.id}
                  className="p-6 md:p-8 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <h3 className="text-lg font-medium text-slate-800 mb-6 leading-relaxed">
                    <span className="text-primary mr-2 font-bold">{index + 1}.</span>
                    {q.texto_pergunta}
                  </h3>

                  <RadioGroup
                    onValueChange={(val) => setAnswer(q.id, val as AnswerValue)}
                    value={answers[q.id] || ''}
                    className="grid sm:grid-cols-2 gap-3"
                  >
                    {[
                      { value: 'completo', label: 'Completo' },
                      { value: 'parcial', label: 'Parcial' },
                      { value: 'nao', label: 'Não' },
                      { value: 'naosei', label: 'Não Sei Informar' },
                    ].map((opt) => (
                      <div
                        key={opt.value}
                        className={cn(
                          'flex items-center space-x-3 border-2 p-4 rounded-lg cursor-pointer transition-all',
                          answers[q.id] !== opt.value &&
                            'hover:bg-muted/50 border-transparent bg-muted/20',
                          answers[q.id] === opt.value &&
                            opt.value === 'completo' &&
                            'border-secondary bg-secondary/5',
                          answers[q.id] === opt.value &&
                            opt.value === 'parcial' &&
                            'border-accent bg-accent/5',
                          answers[q.id] === opt.value &&
                            opt.value === 'nao' &&
                            'border-destructive bg-destructive/5',
                          answers[q.id] === opt.value &&
                            opt.value === 'naosei' &&
                            'border-slate-500 bg-slate-500/5',
                        )}
                      >
                        <RadioGroupItem
                          value={opt.value}
                          id={`${q.id}-${opt.value}`}
                          className={cn(
                            'h-5 w-5 border-slate-300',
                            answers[q.id] === opt.value &&
                              opt.value === 'completo' &&
                              'border-secondary text-secondary',
                            answers[q.id] === opt.value &&
                              opt.value === 'parcial' &&
                              'border-accent text-accent',
                            answers[q.id] === opt.value &&
                              opt.value === 'nao' &&
                              'border-destructive text-destructive',
                            answers[q.id] === opt.value &&
                              opt.value === 'naosei' &&
                              'border-slate-500 text-slate-500',
                          )}
                        />
                        <Label
                          htmlFor={`${q.id}-${opt.value}`}
                          className="flex-1 cursor-pointer text-base font-medium"
                        >
                          {opt.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between p-6 bg-muted/30 rounded-b-xl border-t">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentCategoryIndex === 0}
              className="px-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
            </Button>

            <Button
              onClick={handleNext}
              disabled={!isCategoryComplete}
              className={cn(
                'px-8',
                isLastCategory && 'bg-secondary hover:bg-secondary/90 text-white',
              )}
            >
              {isLastCategory ? (
                <>
                  Ver Resultado <CheckCircle2 className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Próxima Etapa <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
