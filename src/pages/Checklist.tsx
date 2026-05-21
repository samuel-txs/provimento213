import { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useChecklist } from '@/hooks/use-checklist'
import { CATEGORIES, QUESTIONS, AnswerValue } from '@/lib/questions'
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
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Checklist() {
  const navigate = useNavigate()
  const { leadData, answers, setAnswer } = useChecklist()
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentCategoryIndex])

  // Protect route
  if (!leadData) {
    return <Navigate to="/identificacao" replace />
  }

  const currentCategory = CATEGORIES[currentCategoryIndex]
  const currentQuestions = QUESTIONS.filter((q) => q.categoryId === currentCategory.id)
  const isLastCategory = currentCategoryIndex === CATEGORIES.length - 1
  const isCategoryComplete = currentQuestions.every((q) => answers[q.id])

  // Progress calculates based on completed questions across ALL categories for smoother bar
  const totalQuestions = QUESTIONS.length
  const answeredQuestions = Object.keys(answers).length
  const progress = (answeredQuestions / totalQuestions) * 100

  const handleNext = () => {
    if (isLastCategory) {
      navigate('/resultado')
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
        {/* Progress Header */}
        <div className="mb-8 sticky top-20 z-10 bg-background/95 backdrop-blur p-4 rounded-xl shadow-sm border">
          <div className="flex justify-between text-sm font-medium mb-3 text-slate-600">
            <span>Progresso Geral</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2.5" />
          <div className="mt-4 text-xs font-semibold text-primary uppercase tracking-wider">
            Etapa {currentCategoryIndex + 1} de {CATEGORIES.length}
          </div>
        </div>

        {/* Category Card */}
        <Card className="border-none shadow-elevation animate-slide-up">
          <CardHeader className="bg-primary text-primary-foreground rounded-t-xl pb-6">
            <CardTitle className="text-2xl">{currentCategory.title}</CardTitle>
            <CardDescription className="text-primary-foreground/80 text-base mt-2">
              {currentCategory.description}
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
                    {q.text}
                  </h3>

                  <RadioGroup
                    onValueChange={(val) => setAnswer(q.id, val as AnswerValue)}
                    value={answers[q.id] || ''}
                    className="flex flex-col space-y-3"
                  >
                    <div
                      className={cn(
                        'flex items-center space-x-3 border-2 p-4 rounded-lg cursor-pointer transition-all',
                        answers[q.id] === 'sim'
                          ? 'border-secondary bg-secondary/5'
                          : 'hover:bg-muted/50 border-transparent bg-muted/20',
                      )}
                    >
                      <RadioGroupItem
                        value="sim"
                        id={`${q.id}-sim`}
                        className="h-5 w-5 border-slate-300 data-[state=checked]:border-secondary data-[state=checked]:text-secondary"
                      />
                      <Label
                        htmlFor={`${q.id}-sim`}
                        className="flex-1 cursor-pointer text-base font-medium"
                      >
                        Sim, totalmente adequado
                      </Label>
                    </div>

                    <div
                      className={cn(
                        'flex items-center space-x-3 border-2 p-4 rounded-lg cursor-pointer transition-all',
                        answers[q.id] === 'parcial'
                          ? 'border-accent bg-accent/5'
                          : 'hover:bg-muted/50 border-transparent bg-muted/20',
                      )}
                    >
                      <RadioGroupItem
                        value="parcial"
                        id={`${q.id}-parcial`}
                        className="h-5 w-5 border-slate-300 data-[state=checked]:border-accent data-[state=checked]:text-accent"
                      />
                      <Label
                        htmlFor={`${q.id}-parcial`}
                        className="flex-1 cursor-pointer text-base font-medium"
                      >
                        Parcialmente / Em andamento
                      </Label>
                    </div>

                    <div
                      className={cn(
                        'flex items-center space-x-3 border-2 p-4 rounded-lg cursor-pointer transition-all',
                        answers[q.id] === 'nao'
                          ? 'border-destructive bg-destructive/5'
                          : 'hover:bg-muted/50 border-transparent bg-muted/20',
                      )}
                    >
                      <RadioGroupItem
                        value="nao"
                        id={`${q.id}-nao`}
                        className="h-5 w-5 border-slate-300 data-[state=checked]:border-destructive data-[state=checked]:text-destructive"
                      />
                      <Label
                        htmlFor={`${q.id}-nao`}
                        className="flex-1 cursor-pointer text-base font-medium"
                      >
                        Não implementado
                      </Label>
                    </div>
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
                  Finalizar Diagnóstico <CheckCircle2 className="ml-2 h-4 w-4" />
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
