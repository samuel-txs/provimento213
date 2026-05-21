import React, { createContext, useContext, useState, ReactNode } from 'react'
import { AnswerValue } from '@/lib/questions'

export interface LeadData {
  nome: string
  email: string
  telefone: string
  cartorio: string
  cnpj: string
}

export type AnswerValue = 'completo' | 'parcial' | 'nao' | 'naosei'

export interface Question {
  id: string
  categoria: string
  texto_pergunta: string
  ordem: number
}

interface ChecklistContextType {
  leadData: LeadData | null
  setLeadData: (data: LeadData) => void
  answers: Record<string, AnswerValue>
  setAnswer: (questionId: string, answer: AnswerValue) => void
  reset: () => void
  score: number
  questions: Question[]
  loadingQuestions: boolean
}

const ChecklistContext = createContext<ChecklistContextType | undefined>(undefined)

export function ChecklistProvider({ children }: { children: ReactNode }) {
  const [leadData, setLeadData] = useState<LeadData | null>(null)
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({})
  const [questions, setQuestions] = useState<Question[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(true)

  React.useEffect(() => {
    import('@/services/api').then(({ getPerguntas }) => {
      getPerguntas()
        .then((res) => {
          setQuestions(res as any)
          setLoadingQuestions(false)
        })
        .catch((err) => {
          console.error(err)
          setLoadingQuestions(false)
        })
    })
  }, [])

  const setAnswer = (questionId: string, answer: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const reset = () => {
    setLeadData(null)
    setAnswers({})
  }

  const calculateScore = () => {
    const total = questions.length
    if (total === 0) return 0

    let points = 0
    Object.values(answers).forEach((val) => {
      if (val === 'completo') points += 25
      else if (val === 'parcial') points += 15
      else if (val === 'naosei') points += 5
      else if (val === 'nao') points += 0
    })

    const maxPoints = total * 25
    return Math.round((points / maxPoints) * 100)
  }

  return (
    <ChecklistContext.Provider
      value={{
        leadData,
        setLeadData,
        answers,
        setAnswer,
        reset,
        score: calculateScore(),
        questions,
        loadingQuestions,
      }}
    >
      {children}
    </ChecklistContext.Provider>
  )
}

export function useChecklist() {
  const context = useContext(ChecklistContext)
  if (!context) {
    throw new Error('useChecklist must be used within a ChecklistProvider')
  }
  return context
}
