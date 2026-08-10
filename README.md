# Mesa de Análise — Presença

Ferramenta interna de fila de propostas + dashboard, feita em HTML/JS puro (sem build, sem dependências de servidor).

## Como hospedar (GitHub Pages)

1. Crie um repositório novo no GitHub
2. Suba o arquivo `index.html` (já renomeado)
3. Vá em **Settings → Pages**
4. Em "Source", selecione a branch `main` e a pasta raiz (`/`)
5. Salve — em poucos minutos você recebe uma URL tipo `https://seu-usuario.github.io/nome-do-repo/`

## Antes de divulgar a URL pro time

- Confirme com o backend se a API libera chamadas de origens fora de `portal.soupresenca.com.br` (CORS)
- Troque a constante `PROXY_URL` no código pela URL do seu Cloudflare Worker (veja `worker.js`), se você já tiver implantado o proxy que esconde os endpoints reais
- Apague a linha de teste (`operacaoId: 999999`) na planilha do Google Sheets usada pra "quem está em análise", se ainda estiver lá
