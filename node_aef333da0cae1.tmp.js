const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

const apiKey = 'SUA_CHAVE_DE_API'; // Substitua pela sua chave de API

// Middleware para lidar com JSON
app.use(express.json());

// Rota para calcular o frete
app.get('/calcular-frete', async (req, res) => {
  const { enderecoDestino } = req.query;
  const enderecoOrigem = "R. Mauricio Rodrigues, 150 - Jr Cristo Redentor, Ribeirão Preto - SP, 14063-301";

  if (!enderecoDestino) {
    return res.status(400).json({ message: 'Por favor, digite um endereço válido.' });
  }

  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(enderecoOrigem)}&destination=${encodeURIComponent(enderecoDestino)}&key=${apiKey}`;

  try {
    const resposta = await axios.get(url);
    const dados = resposta.data;

    if (dados.routes.length > 0) {
      const rota = dados.routes[0];

      if (rota.legs.length > 0) {
        const distanciaMetro = rota.legs[0].distance.value;
        const distanciaKm = distanciaMetro / 1000;

        if (distanciaKm > 12) {
          return res.json({ message: 'Não entregamos nesse endereço.' });
        } else {
          const frete = distanciaKm * 1; // Valor do frete: R$ 1,00 por km
          return res.json({
            distanciaKm: distanciaKm.toFixed(2),
            frete: frete.toFixed(2),
            mensagem: `A distância é de ${distanciaKm.toFixed(2)} km. O valor do frete é R$ ${frete.toFixed(2)}.`
          });
        }
      } else {
        return res.json({ message: 'Endereço não encontrado.' });
      }
    } else {
      return res.json({ message: 'Rota não encontrada.' });
    }
  } catch (erro) {
    console.error('Erro ao calcular o frete:', erro);
    return res.status(500).json({ message: 'Erro ao calcular o frete.' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});