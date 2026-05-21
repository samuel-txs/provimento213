import React, { createContext, useContext, useState, ReactNode } from 'react'
import { AnswerValue } from '@/lib/questions'

export interface LeadData {
  nomeServentia: string
  responsavel: string
  email: string
  whatsapp: string
  uf: string
}

interface ChecklistContextType {
  leadData: LeadData | null
  setLeadData: (data: LeadData) => void
  answers: Record<string, AnswerValue>
  setAnswer: (questionId: string, answer: AnswerValue) => void
  reset: () => void
  score: number
}

const ChecklistContext = createContext<ChecklistContextType | undefined>(undefined)

export function ChecklistProvider({ children }: { children: ReactNode }) {
  const [leadData, setLeadData] = useState<LeadData | null>(null)
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({})

  const setAnswer = (questionId: string, answer: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const reset = () => {
    setLeadData(null)
    setAnswers({})
  }

  const calculateScore = () => {
    const total = Object.keys(answers).length
    if (total === 0) return 0

    let points = 0
    Object.values(answers).forEach((val) => {
      if (val === 'sim') points += 1
      else if (val === 'parcial') points += 0.5
    })

    return Math.round((points / total) * 100)
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
