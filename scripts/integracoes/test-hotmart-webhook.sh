#!/usr/bin/env bash
# Testa o webhook Hotmart enviando um payload de exemplo (PURCHASE_APPROVED).
#
# Uso:
#   export WEBHOOK_BASE_URL="https://seu-dominio.vercel.app"  # ou http://localhost:3000
#   export EMPRESA_ID="uuid-da-empresa"
#   export HOTTOK="seu-hottok-da-hotmart"
#   ./scripts/integracoes/test-hotmart-webhook.sh
#
# Ou defina as variáveis no início do script e execute.

set -e

# Configure aqui ou use variáveis de ambiente
WEBHOOK_BASE_URL="${WEBHOOK_BASE_URL:-http://localhost:3000}"
EMPRESA_ID="${EMPRESA_ID:-}"
HOTTOK="${HOTTOK:-}"

if [ -z "$EMPRESA_ID" ] || [ -z "$HOTTOK" ]; then
  echo "Erro: defina EMPRESA_ID e HOTTOK (ou WEBHOOK_BASE_URL)."
  echo "Exemplo:"
  echo "  export EMPRESA_ID=\"uuid-da-empresa\""
  echo "  export HOTTOK=\"seu-hottok\""
  echo "  $0"
  exit 1
fi

URL="${WEBHOOK_BASE_URL}/api/webhooks/hotmart?empresaId=${EMPRESA_ID}"

# Payload mínimo PURCHASE_APPROVED (formato Hotmart v2.0.0)
PAYLOAD='{
  "id": "test-event-'$(date +%s)'",
  "creation_date": '$(date +%s000)',
  "event": "PURCHASE_APPROVED",
  "version": "2.0.0",
  "data": {
    "product": { "id": 123456, "name": "Curso Teste Webhook", "ucode": "TEST-WEBHOOK" },
    "buyer": {
      "email": "aluno-teste-webhook@exemplo.com",
      "name": "Aluno Teste Webhook",
      "document": "12345678900"
    },
    "purchase": {
      "transaction": "TX-TEST-'$(date +%s)'",
      "status": "APPROVED",
      "approved_date": '$(date +%s000)',
      "payment": { "type": "PIX", "installments_number": 1 },
      "price": { "value": 197.00, "currency_code": "BRL" }
    }
  }
}'

echo "Enviando POST para: $URL"
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$URL" \
  -H "Content-Type: application/json" \
  -H "X-HOTMART-HOTTOK: $HOTTOK" \
  -d "$PAYLOAD")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP $HTTP_CODE"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
  echo "Sucesso: webhook aceitou o payload."
else
  echo "Falha: verifique empresaId, Hottok e logs do servidor."
  exit 1
fi
