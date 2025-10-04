import { useState, useEffect } from 'react'
import { supabase, type FeedbackRow, type FeedbackInsert } from '../lib/supabase'
import { toast } from 'sonner'

export interface FeedbackMessage {
  id: string
  name: string
  email?: string
  product?: string
  message: string
  rating: number
  date: string
}

export const useFeedback = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  console.log('useFeedback hook initialized with Supabase integration')

  // Carregar feedbacks do Supabase
  const loadFeedbacks = async () => {
    try {
      setIsLoading(true)
      console.log('Carregando feedbacks do Supabase...')
      
      const { data, error } = await supabase
        .from('feedbacks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.error('Erro ao carregar feedbacks:', error)
        toast.error('Erro ao carregar feedbacks')
        return
      }

      const formattedFeedbacks: FeedbackMessage[] = data.map((feedback: FeedbackRow) => ({
        id: feedback.id,
        name: feedback.name,
        email: feedback.email,
        product: feedback.product,
        message: feedback.message,
        rating: feedback.rating,
        date: new Date(feedback.created_at).toLocaleString('pt-BR')
      }))

      console.log('Feedbacks carregados do Supabase:', formattedFeedbacks.length)
      setFeedbacks(formattedFeedbacks)
    } catch (error) {
      console.error('Erro inesperado ao carregar feedbacks:', error)
      toast.error('Erro inesperado ao carregar feedbacks')
    } finally {
      setIsLoading(false)
    }
  }

  // Carregar feedbacks na inicialização
  useEffect(() => {
    loadFeedbacks()
  }, [])

  // Adicionar novo feedback
  const addFeedback = async (feedback: Omit<FeedbackMessage, 'id' | 'date'>) => {
    try {
      setIsSubmitting(true)
      console.log('=== ADICIONANDO FEEDBACK AO SUPABASE ===')
      console.log('Feedback a ser adicionado:', feedback)
      
      const feedbackData: FeedbackInsert = {
        name: feedback.name,
        email: feedback.email,
        product: feedback.product,
        message: feedback.message,
        rating: feedback.rating
      }

      const { data, error } = await supabase
        .from('feedbacks')
        .insert([feedbackData])
        .select()
        .single()

      if (error) {
        console.error('Erro ao salvar feedback no Supabase:', error)
        toast.error('Erro ao enviar feedback. Tente novamente.')
        throw error
      }

      console.log('Feedback salvo no Supabase:', data)
      
      // Recarregar a lista de feedbacks
      await loadFeedbacks()
      
      toast.success('Feedback enviado com sucesso!')
      return data.id
    } catch (error) {
      console.error('Erro ao adicionar feedback:', error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRecentFeedbacks = (limit: number = 5) => {
    return feedbacks.slice(0, limit)
  }

  // Recarregar feedbacks manualmente
  const refreshFeedbacks = () => {
    return loadFeedbacks()
  }

  // Debug logs
  console.log('Hook estado atual:', { 
    feedbacksCount: feedbacks.length,
    isLoading,
    isSubmitting,
    recentFeedbacks: feedbacks.slice(0, 3).map(f => ({ id: f.id, name: f.name, rating: f.rating }))
  })

  return {
    feedbacks,
    addFeedback,
    getRecentFeedbacks,
    refreshFeedbacks,
    feedbacksCount: feedbacks.length,
    isLoading,
    isSubmitting
  }
}