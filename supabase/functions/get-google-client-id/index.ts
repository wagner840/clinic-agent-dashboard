
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Isso é necessário para invocar a função a partir de um navegador.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const clientId = Deno.env.get('client_id')
    if (!clientId) {
      console.error('Segredo ausente: client_id');
      return new Response(
        JSON.stringify({ error: 'Erro Interno do Servidor: Google Client ID não configurado.' }), 
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      )
    }

    return new Response(
      JSON.stringify({ clientId }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Erro ao buscar Google Client ID:', error.message);
    return new Response(
      JSON.stringify({ error: 'Falha ao recuperar o Google Client ID.' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
