# Testa o webhook Hotmart enviando um payload de exemplo (PURCHASE_APPROVED).
#
# Uso:
#   $env:WEBHOOK_BASE_URL = "https://seu-dominio.vercel.app"
#   $env:EMPRESA_ID = "uuid-da-empresa"
#   $env:HOTTOK = "seu-hottok-da-hotmart"
#   .\scripts\integracoes\test-hotmart-webhook.ps1

$baseUrl = if ($env:WEBHOOK_BASE_URL) { $env:WEBHOOK_BASE_URL } else { "http://localhost:3000" }
$empresaId = $env:EMPRESA_ID
$hottok = $env:HOTTOK

if (-not $empresaId -or -not $hottok) {
  Write-Error "Defina EMPRESA_ID e HOTTOK. Exemplo: `n  `$env:EMPRESA_ID = 'uuid'`n  `$env:HOTTOK = 'seu-hottok'"
  exit 1
}

$url = "$baseUrl/api/webhooks/hotmart?empresaId=$empresaId"
$txId = "TX-TEST-" + [int][double]::Parse((Get-Date -UFormat %s))
$eventId = "test-event-" + [int][double]::Parse((Get-Date -UFormat %s))
$ts = [int][double]::Parse((Get-Date -UFormat %s)) * 1000

$body = @{
  id = $eventId
  creation_date = $ts
  event = "PURCHASE_APPROVED"
  version = "2.0.0"
  data = @{
    product = @{ id = 123456; name = "Curso Teste Webhook"; ucode = "TEST-WEBHOOK" }
    buyer = @{
      email = "aluno-teste-webhook@exemplo.com"
      name = "Aluno Teste Webhook"
      document = "12345678900"
    }
    purchase = @{
      transaction = $txId
      status = "APPROVED"
      approved_date = $ts
      payment = @{ type = "PIX"; installments_number = 1 }
      price = @{ value = 197.00; currency_code = "BRL" }
    }
  }
} | ConvertTo-Json -Depth 10

$headers = @{
  "Content-Type" = "application/json"
  "X-HOTMART-HOTTOK" = $hottok
}

Write-Host "Enviando POST para: $url"
try {
  $response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $body
  Write-Host "Sucesso: webhook aceitou o payload."
  $response | ConvertTo-Json -Depth 5
} catch {
  Write-Host "HTTP $($_.Exception.Response.StatusCode.value__)"
  if ($_.ErrorDetails.Message) { Write-Host $_.ErrorDetails.Message }
  Write-Error "Falha: verifique empresaId, Hottok e logs do servidor."
  exit 1
}
