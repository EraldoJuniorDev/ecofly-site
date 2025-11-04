import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // Importe do arquivo criado no Passo 3

const FeedbackForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [product, setProduct] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validação simples
    if (!name || !message || rating < 1 || rating > 5) {
      setError('Preencha nome, mensagem e uma avaliação entre 1 e 5.');
      setLoading(false);
      return;
    }

    const feedbackData = {
      name,
      email: email || null, // Opcional
      product: product || null, // Opcional
      message,
      rating,
    };

    const { data, error } = await supabase
      .from('feedbacks')
      .insert([feedbackData]);

    setLoading(false);

    if (error) {
      setError('Erro ao enviar feedback: ' + error.message);
    } else {
      setSuccess(true);
      // Limpar formulário
      setName('');
      setEmail('');
      setProduct('');
      setMessage('');
      setRating(1);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Enviar Feedback</h2>
      <label>Nome:</label>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      <br />
      <label>Email (opcional):</label>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <br />
      <label>Produto (opcional):</label>
      <input type="text" value={product} onChange={(e) => setProduct(e.target.value)} />
      <br />
      <label>Mensagem:</label>
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} required />
      <br />
      <label>Avaliação (1-5):</label>
      <input type="number" value={rating} onChange={(e) => setRating(parseInt(e.target.value))} min="1" max="5" required />
      <br />
      <button type="submit" disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar'}
      </button>
      {success && <p>Feedback enviado com sucesso!</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
};

export default FeedbackForm;