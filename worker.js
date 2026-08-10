// ============================================================
// Proxy da Mesa de Análise — esconde os endpoints reais da API
// ============================================================
// O navegador só fala com ESTE Worker. Ele é quem sabe traduzir
// cada "action" (nome genérico) para a chamada real na API da
// Presença, por trás — o Network do navegador nunca vê a URL
// real nem o path real, nem no corpo da requisição.

const REAL_API_BASE = 'https://presenca-bank-api.azurewebsites.net';

// Mapa: nome de ação (opaco) -> método + caminho reais na API
const ROTAS = {
  login:               { method: 'POST',  path: () => '/login' },
  listarOperacoes:      { method: 'POST',  path: () => '/v2/operacoes/listar' },
  validarCompliance:    { method: 'PUT',   path: (p) => `/operacoes/${p.id}/validar-compliance` },
  pendenciar:           { method: 'PATCH', path: (p) => `/operacoes/${p.id}/pendenciar` },
  checklist:            { method: 'GET',   path: (p) => `/v5/operacoes/check-list/${p.id}` },
  motivosCancelamento:  { method: 'GET',   path: () => '/operacoes/motivos-cancelamento' },
  cancelarProposta:     { method: 'PUT',   path: (p) => `/operacoes/${p.id}/cancelar/${p.motivoId}` },
  etapas:               { method: 'GET',   path: (p) => `/operacoes/etapas?IdProposta=${p.id}` },
};

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ message: 'Método não permitido' }), {
        status: 405,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return new Response(JSON.stringify({ message: 'Corpo da requisição inválido' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const { action, params, body } = payload;
    const rota = ROTAS[action];

    if (!rota) {
      return new Response(JSON.stringify({ message: 'Ação desconhecida' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const url = REAL_API_BASE + rota.path(params || {});
    const headers = { 'Content-Type': 'application/json' };
    const auth = request.headers.get('Authorization');
    if (auth) headers['Authorization'] = auth;

    let upstream;
    try {
      upstream = await fetch(url, {
        method: rota.method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (e) {
      return new Response(JSON.stringify({ message: 'Falha ao contatar a API real' }), {
        status: 502,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const respBody = await upstream.text();
    return new Response(respBody, {
      status: upstream.status,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': upstream.headers.get('Content-Type') || 'application/json',
      },
    });
  },
};
