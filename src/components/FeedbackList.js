import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Importe do arquivo criado no Passo 3

const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      const { data, error } = await supabase
        .from('feedbacks')
        .select('*')
        .order('created_at', { ascending: false }); // Ordenar por data recente

      setLoading(false);

      if (error) {
        setError('Erro ao carregar feedbacks: ' + error.message);
      } else {
        setFeedbacks(data);
      }
    };

    fetchFeedbacks();
  }, []); // Executa uma vez ao montar

  if (loading) return <p>Carregando feedbacks...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Lista de Feedbacks</h2>
      {feedbacks.length === 0 ? (
        <p>Nenhum feedback encontrado.</p>
      ) : (
        <ul>
          {feedbacks.map((fb) => (
            <li key={fb.id}>
              <strong>{fb.name}</strong> ({fb.rating} estrelas) - {fb.product || 'Geral'}: {fb.message}
              <br />
              <small>{new Date(fb.created_at).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FeedbackList;