import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChecklist, AnswerValue } from '@/hooks/use-checklist'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Check,
  Loader2,
  ShieldAlert,
  Sparkles,
  FileCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import logoImg from '@/assets/logo-fundopreto-ti-express-tagline-5e290.png'
import { useConfiguracoes } from '@/hooks/use-configuracoes'
import { GaugeChart } from '@/components/GaugeChart'

export default function Checklist() {
  const navigate = useNavigate()
  const { answers, setAnswer, questions, options, loadingQuestions, score } = useChecklist()
  const { configs } = useConfiguracoes()
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0)
  const [showScoreStep, setShowScoreStep] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentCategoryIndex, showScoreStep])

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
  const allQuestionsAnswered = totalQuestions > 0 && answeredQuestions === totalQuestions
  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0

  const handleNext = () => {
    if (isLastCategory) {
      setShowScoreStep(true)
    } else {
      setCurrentCategoryIndex((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    if (showScoreStep) {
      setShowScoreStep(false)
      setCurrentCategoryIndex(categories.length - 1)
    } else {
      setCurrentCategoryIndex((prev) => prev - 1)
    }
  }

  const handleProceedToIdentification = () => {
    navigate('/identificacao')
  }

  const getScoreDiagnosis = (s: number) => {
    if (s >= 91) {
      return {
        label: 'Excelente',
        badgeClass: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30',
        textColor: 'text-emerald-600',
        borderColor: 'border-emerald-500',
        bgCard: 'from-emerald-50/70 to-emerald-100/30',
        icon: CheckCircle2,
        title: 'Nível Alto de Conformidade',
        description:
          'Sua serventia atende à maioria expressiva dos requisitos técnicos do Provimento 213 CNJ.',
      }
    }
    if (s >= 71) {
      return {
        label: 'Adequado',
        badgeClass: 'bg-blue-500/10 text-blue-700 border-blue-500/30',
        textColor: 'text-blue-600',
        borderColor: 'border-blue-500',
        bgCard: 'from-blue-50/70 to-blue-100/30',
        icon: CheckCircle2,
        title: 'Bom nível de conformidade',
        description:
          'Sua serventia está no caminho certo, mas restam pontos fundamentais a serem regularizados.',
      }
    }
    if (s >= 41) {
      return {
        label: 'Atenção',
        badgeClass: 'bg-amber-500/10 text-amber-700 border-amber-500/30',
        textColor: 'text-amber-600',
        borderColor: 'border-amber-500',
        bgCard: 'from-amber-50/70 to-amber-100/30',
        icon: AlertTriangle,
        title: 'Atenção Necessária',
        description:
          'Foram detectadas vulnerabilidades importantes que requerem ajustes para cumprir as normas da Corregedoria.',
      }
    }
    return {
      label: 'Crítico',
      badgeClass: 'bg-rose-500/10 text-rose-700 border-rose-500/30',
      textColor: 'text-rose-600',
      borderColor: 'border-rose-500',
      bgCard: 'from-rose-50/70 to-rose-100/30',
      icon: XCircle,
      title: 'Risco Regulatório Elevado',
      description:
        'A infraestrutura atual apresenta desconformidades críticas com os requisitos obrigatórios do Provimento 213.',
    }
  }

  const diagnosis = getScoreDiagnosis(score)
  const DiagnosisIcon = diagnosis.icon

  // Count items summary
  const summaryCounts = {
    completo: Object.values(answers).filter((v) => v === 'completo').length,
    parcial: Object.values(answers).filter((v) => v === 'parcial').length,
    nao: Object.values(answers).filter((v) => v === 'não' || v === 'nao').length,
    nao_sei: Object.values(answers).filter((v) => v === 'nao_sei' || v === 'naosei').length,
  }

  // Visual helper for selectable cards based on value
  const getOptionStyle = (valor: string, isSelected: boolean) => {
    const isCompleto = valor === 'completo'
    const isParcial = valor === 'parcial'
    const isNao = valor === 'não' || valor === 'nao'
    const isNaoSei = valor === 'nao_sei' || valor === 'naosei'

    if (isSelected) {
      if (isCompleto) {
        return {
          container:
            'bg-emerald-50/90 border-emerald-500 text-emerald-950 shadow-md ring-2 ring-emerald-500/30',
          checkCircle: 'bg-emerald-600 text-white border-emerald-600',
        }
      }
      if (isParcial) {
        return {
          container:
            'bg-amber-50/90 border-amber-500 text-amber-950 shadow-md ring-2 ring-amber-500/30',
          checkCircle: 'bg-amber-500 text-white border-amber-500',
        }
      }
      if (isNao) {
        return {
          container:
            'bg-rose-50/90 border-rose-500 text-rose-950 shadow-md ring-2 ring-rose-500/30',
          checkCircle: 'bg-rose-600 text-white border-rose-600',
        }
      }
      // nao_sei or other
      return {
        container:
          'bg-slate-100/90 border-slate-500 text-slate-900 shadow-md ring-2 ring-slate-400/30',
        checkCircle: 'bg-slate-600 text-white border-slate-600',
      }
    }

    // Unselected state with subtle hints based on option value
    if (isCompleto) {
      return {
        container:
          'bg-white hover:bg-emerald-50/40 border-slate-200 hover:border-emerald-300 text-slate-800 hover:shadow-sm',
        checkCircle: 'border-slate-300 bg-white text-transparent group-hover:border-emerald-400',
      }
    }
    if (isParcial) {
      return {
        container:
          'bg-white hover:bg-amber-50/40 border-slate-200 hover:border-amber-300 text-slate-800 hover:shadow-sm',
        checkCircle: 'border-slate-300 bg-white text-transparent group-hover:border-amber-400',
      }
    }
    if (isNao) {
      return {
        container:
          'bg-white hover:bg-rose-50/40 border-slate-200 hover:border-rose-300 text-slate-800 hover:shadow-sm',
        checkCircle: 'border-slate-300 bg-white text-transparent group-hover:border-rose-400',
      }
    }
    return {
      container:
        'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800 hover:shadow-sm',
      checkCircle: 'border-slate-300 bg-white text-transparent group-hover:border-slate-400',
    }
  }

  return (
    <div className="flex-1 bg-muted/20 py-8 px-4 animate-fade-in">
      <div className="container max-w-3xl mx-auto">
        {/* Logo Header */}
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

        {/* Progress & Category Tabs Header */}
        <div className="mb-8 sticky top-20 z-10 bg-background/95 backdrop-blur p-6 rounded-xl shadow-sm border">
          <div className="flex justify-between items-center text-sm font-medium mb-3 text-slate-600">
            <span>Progresso do Diagnóstico</span>
            <span className="font-semibold text-primary">
              {showScoreStep ? '100% (Concluído)' : `${Math.round(progress)}%`}
            </span>
          </div>
          <Progress value={showScoreStep ? 100 : progress} className="h-2.5" />

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 mt-6">
            {categories.map((cat, idx) => {
              const catQuestions = questions.filter((q) => q.categoria === cat)
              const isCatComplete = catQuestions.every((q) => answers[q.id])
              const isActive = !showScoreStep && idx === currentCategoryIndex

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setShowScoreStep(false)
                    setCurrentCategoryIndex(idx)
                  }}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-all border flex items-center gap-1.5',
                    isActive
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm ring-2 ring-primary/20'
                      : isCatComplete
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/60'
                        : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200',
                  )}
                >
                  <span>{cat}</span>
                  {isCatComplete && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  )}
                </button>
              )
            })}

            {/* Score step tab (enabled if all answered or user reached last step) */}
            <button
              type="button"
              onClick={() => {
                if (allQuestionsAnswered) {
                  setShowScoreStep(true)
                }
              }}
              disabled={!allQuestionsAnswered}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all border flex items-center gap-1.5',
                showScoreStep
                  ? 'bg-orange-600 text-white border-orange-600 shadow-sm ring-2 ring-orange-500/20'
                  : allQuestionsAnswered
                    ? 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100/60'
                    : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60',
              )}
            >
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span>Score & Diagnóstico</span>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* VIEW 1: SCORE PREVIEW (EXIBIDO ANTES DA IDENTIFICAÇÃO)       */}
        {/* ============================================================ */}
        {showScoreStep ? (
          <Card className="border-none shadow-elevation animate-slide-up overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-900 to-slate-800 text-white pb-6 pt-7 text-center">
              <div className="inline-flex items-center justify-center p-3 bg-primary/20 rounded-full mx-auto mb-3">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-2xl md:text-3xl font-bold">
                Resultado Preliminar do Diagnóstico
              </CardTitle>
              <CardDescription className="text-slate-300 text-base max-w-xl mx-auto mt-2">
                Calculado com base nas respostas fornecidas para as {totalQuestions} exigências do
                Provimento 213 CNJ.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 md:p-8 space-y-8">
              {/* Score Gauge Card */}
              <div
                className={cn(
                  'rounded-2xl p-6 md:p-8 border-2 bg-gradient-to-b shadow-sm transition-all text-center flex flex-col items-center justify-center',
                  diagnosis.bgCard,
                  diagnosis.borderColor,
                )}
              >
                <div className="w-full max-w-md">
                  <GaugeChart score={score} />
                </div>

                <div className="mt-6 flex flex-col items-center space-y-3">
                  <Badge
                    variant="outline"
                    className={cn(
                      'px-4 py-1.5 text-sm uppercase font-bold border-2 flex items-center gap-2',
                      diagnosis.badgeClass,
                    )}
                  >
                    <DiagnosisIcon className="h-4 w-4 shrink-0" />
                    <span>Diagnóstico: {diagnosis.label}</span>
                  </Badge>

                  <h3 className="text-xl md:text-2xl font-bold text-slate-900">
                    {diagnosis.title}
                  </h3>
                  <p className="text-slate-600 max-w-lg text-base leading-relaxed">
                    {diagnosis.description}
                  </p>
                </div>
              </div>

              {/* Breakdown Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 text-center">
                  <span className="text-2xl font-bold text-emerald-700 block">
                    {summaryCounts.completo}
                  </span>
                  <span className="text-xs md:text-sm font-medium text-emerald-800">
                    Conforme (Completo)
                  </span>
                </div>
                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 text-center">
                  <span className="text-2xl font-bold text-amber-700 block">
                    {summaryCounts.parcial}
                  </span>
                  <span className="text-xs md:text-sm font-medium text-amber-800">Parcial</span>
                </div>
                <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-4 text-center">
                  <span className="text-2xl font-bold text-rose-700 block">
                    {summaryCounts.nao}
                  </span>
                  <span className="text-xs md:text-sm font-medium text-rose-800">Não Conforme</span>
                </div>
                <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 text-center">
                  <span className="text-2xl font-bold text-slate-700 block">
                    {summaryCounts.nao_sei}
                  </span>
                  <span className="text-xs md:text-sm font-medium text-slate-600">Não Sei</span>
                </div>
              </div>

              {/* Callout Info */}
              <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-5 flex items-start gap-4">
                <FileCheck className="h-6 w-6 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900 leading-relaxed">
                  <p className="font-semibold text-base mb-1">
                    Próximo Passo: Liberação do Relatório Completo com Recomendações
                  </p>
                  <p className="text-blue-800">
                    Para visualizar o plano de ação detalhado por artigo do Provimento 213, baixar o
                    PDF oficial ou receber a assessoria técnica da nossa equipe, confirme seus dados
                    a seguir.
                  </p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row items-center justify-between p-6 bg-background/95 backdrop-blur rounded-b-xl border-t gap-4 sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <Button variant="outline" onClick={handlePrev} className="w-full sm:w-auto px-6 h-12">
                <ArrowLeft className="mr-2 h-4 w-4" /> Revisar Perguntas
              </Button>

              <Button
                onClick={handleProceedToIdentification}
                size="lg"
                className="w-full sm:w-auto px-8 h-12 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-base shadow-lg shadow-orange-600/20"
              >
                Continuar para Identificação
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardFooter>
          </Card>
        ) : (
          /* ============================================================ */
          /* VIEW 2: CHECKLIST QUESTIONS COM BLOCOS CLICÁVEIS             */
          /* ============================================================ */
          <Card className="border-none shadow-elevation animate-slide-up">
            <CardHeader className="bg-primary text-primary-foreground rounded-t-xl pb-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">{currentCategory}</CardTitle>
                <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full text-white">
                  Etapa {currentCategoryIndex + 1} de {categories.length}
                </span>
              </div>
              <CardDescription className="text-primary-foreground/90 text-base mt-2">
                Responda às questões referentes à categoria de {currentCategory}. Clique no bloco
                para selecionar a resposta.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {currentQuestions.map((q, index) => {
                  const currentAnswer = answers[q.id]
                  const currentOptions =
                    options[q.id] && options[q.id].length > 0
                      ? options[q.id]
                      : [
                          {
                            id: 'opt_nao',
                            pergunta_id: q.id,
                            texto_opcao: 'Não implementado',
                            valor: 'não',
                            ordem: 1,
                          },
                          {
                            id: 'opt_parcial',
                            pergunta_id: q.id,
                            texto_opcao: 'Implementação Parcial',
                            valor: 'parcial',
                            ordem: 2,
                          },
                          {
                            id: 'opt_completo',
                            pergunta_id: q.id,
                            texto_opcao: 'Implementação Completa e Documentada',
                            valor: 'completo',
                            ordem: 3,
                          },
                          {
                            id: 'opt_naosei',
                            pergunta_id: q.id,
                            texto_opcao: 'Não sei informar',
                            valor: 'nao_sei',
                            ordem: 4,
                          },
                        ]

                  return (
                    <div
                      key={q.id}
                      className="p-6 md:p-8 animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-start gap-3 mb-6">
                        <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <h3 className="text-lg md:text-xl font-medium text-slate-800 leading-relaxed">
                          {q.texto_pergunta}
                        </h3>
                      </div>

                      {/* Stacked Vertical Option Blocks */}
                      <div className="space-y-3 w-full">
                        {currentOptions.map((opt) => {
                          const isSelected = currentAnswer === opt.valor
                          const style = getOptionStyle(opt.valor, isSelected)

                          return (
                            <button
                              key={opt.id || `${q.id}-${opt.valor}`}
                              type="button"
                              onClick={() => setAnswer(q.id, opt.valor as AnswerValue)}
                              aria-pressed={isSelected}
                              className={cn(
                                'group w-full text-left p-4 md:p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer flex items-center gap-4',
                                style.container,
                              )}
                            >
                              {/* Custom radio/check indicator */}
                              <div
                                className={cn(
                                  'h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200',
                                  style.checkCircle,
                                )}
                              >
                                {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                              </div>

                              {/* Option text */}
                              <div className="flex-1 min-w-0">
                                <span className="text-base md:text-lg font-medium leading-normal block">
                                  {opt.texto_opcao}
                                </span>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between p-6 bg-background/95 backdrop-blur rounded-b-xl border-t sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentCategoryIndex === 0}
                className="px-6 h-12"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
              </Button>

              <Button
                onClick={handleNext}
                disabled={!isCategoryComplete}
                className={cn(
                  'px-8 h-12 text-base font-semibold transition-all',
                  isLastCategory
                    ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/20'
                    : 'bg-primary hover:bg-primary/90 text-white',
                )}
              >
                {isLastCategory ? (
                  <>
                    Ver Score Preliminar <Sparkles className="ml-2 h-5 w-5" />
                  </>
                ) : (
                  <>
                    Próxima Etapa <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
}
