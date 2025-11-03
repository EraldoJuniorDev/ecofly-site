import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../../lib/supabaseClient'
import { toast } from 'sonner'

export default function AuthCallback() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()

    useEffect(() => {
        const code = searchParams.get('code')
        const error = searchParams.get('error')

        console.log('Callback recebido:', { code: !!code, error })

        if (error) {
            toast.error(`Erro: ${error}`)
            navigate('/login')
            return
        }

        if (code) {
            supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
                if (error) {
                    toast.error('Falha ao autenticar')
                    navigate('/login')
                } else {
                    toast.success('Login com Google concluído!')
                    navigate('/')
                }
            })
        }
    }, [searchParams, navigate])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-background">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-lg font-medium">Finalizando login...</p>
            </div>
        </div>
    )
}