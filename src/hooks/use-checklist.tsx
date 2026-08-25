import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'

export interface LeadData {
  id?: string
  nome: string
  email: string
  telefone: string
  cartorio: string
  cnpj: string
}

export type AnswerValue = 'completo' | 'parcial' | 'não' | 'nao' | 'nao_sei' | 'naosei'

export interface Opcao {
  id: string
  pergunta_id: string
  texto_opcao: string
  valor: 'não' | 'parcial' | 'completo' | 'nao_sei' | string
  ordem: number
}

export interface Question {
  id: string
  categoria: string
  texto_pergunta: string
  ordem: number
  recomendacao?: string
}

interface ChecklistContextType {
  leadData: LeadData | null
  setLeadData: (data: LeadData) => void
  answers: Record<string, AnswerValue>
  setAnswer: (questionId: string, answer: AnswerValue) => void
  reset: () => void
  score: number
  questions: Question[]
  options: Record<string, Opcao[]>
  loadingQuestions: boolean
}

const ChecklistContext = createContext<ChecklistContextType | undefined>(undefined)

export function ChecklistProvider({ children }: { children: ReactNode }) {
  const [leadData, setLeadData] = useState<LeadData | null>(null)
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({})
  const [questions, setQuestions] = useState<Question[]>([])
  const [options, setOptions] = useState<Record<string, Opcao[]>>({})
  const [loadingQuestions, setLoadingQuestions] = useState(true)

  const fetchChecklistData = async () => {
    try {
      const [questionsRecords, optionsRecords] = await Promise.all([
        pb.collection('perguntas_checklist').getFullList<Question>({ sort: 'ordem' }),
        pb.collection('opcoes_resposta').getFullList<Opcao>({ sort: 'ordem' }),
      ])
      setQuestions(questionsRecords)

      const optionsMap: Record<string, Opcao[]> = {}
      optionsRecords.forEach((opt) => {
        if (!optionsMap[opt.pergunta_id]) {
          optionsMap[opt.pergunta_id] = []
        }
        optionsMap[opt.pergunta_id].push(opt)
      })

      // Sort each question's options by ordem
      Object.keys(optionsMap).forEach((pId) => {
        optionsMap[pId].sort((a, b) => (a.ordem || 0) - (b.ordem || 0))
      })

      setOptions(optionsMap)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingQuestions(false)
    }
  }

  useEffect(() => {
    fetchChecklistData()
  }, [])

  useRealtime('perguntas_checklist', () => {
    fetchChecklistData()
  })

  useRealtime('opcoes_resposta', () => {
    fetchChecklistData()
  })

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
      else if (val === 'nao_sei' || val === 'naosei') points += 5
      else if (val === 'não' || val === 'nao') points += 0
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
        options,
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
