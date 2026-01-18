# Script para remover imports React desnecessários
# React 17+ e Next.js não precisam de import React para JSX

Write-Host "Removendo imports React desnecessários..." -ForegroundColor Green

$filesFixed = 0
$filesSkipped = 0

# Função para verificar se o arquivo usa React diretamente (não apenas JSX)
function Uses-React-Directly {
    param($filePath)
    
    $content = Get-Content $filePath -Raw
    
    # Verifica se usa React.algo (useState, useEffect, etc via React namespace)
    # Mas ignora comentários
    $usesReactNamespace = $content -match "(?<!//.*)\bReact\.[a-zA-Z]+"
    
    return $usesReactNamespace
}

# Função para remover import React
function Remove-React-Import {
    param($filePath)
    
    $content = Get-Content $filePath -Raw
    
    # Remover linhas com import React
    # Padrões a remover:
    # import React from 'react'
    # import React from "react"
    # import * as React from 'react'
    # import * as React from "react"
    
    # Remover a linha inteira incluindo quebras de linha extras
    $newContent = $content -replace "import\s+React\s+from\s+['""]react['""];\?\r?\n?", ""
    $newContent = $newContent -replace "import\s+\*\s+as\s+React\s+from\s+['""]react['""];\?\r?\n?", ""
    
    # Remover linhas vazias duplicadas que podem ter sobrado
    $newContent = $newContent -replace "(\r?\n){3,}", "`n`n"
    
    Set-Content -Path $filePath -Value $newContent -NoNewline
}

# Processar arquivos .tsx em app/
Write-Host "`nProcessando arquivos em app/..." -ForegroundColor Cyan
$appFiles = Get-ChildItem -Path "app" -Filter "*.tsx" -Recurse -File

foreach ($file in $appFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Verificar se tem import React
    if ($content -notmatch "import\s+(\*\s+as\s+)?React\s+from\s+['""]react['""]") {
        $filesSkipped++
        continue
    }
    
    # Verificar se usa React diretamente
    if (Uses-React-Directly $file.FullName) {
        Write-Host "  Mantendo (usa React diretamente): $($file.FullName)" -ForegroundColor Yellow
        $filesSkipped++
        continue
    }
    
    Write-Host "  Removendo: $($file.FullName)" -ForegroundColor Green
    Remove-React-Import $file.FullName
    $filesFixed++
}

# Processar arquivos .tsx em components/
Write-Host "`nProcessando arquivos em components/..." -ForegroundColor Cyan
$componentFiles = Get-ChildItem -Path "components" -Filter "*.tsx" -Recurse -File

foreach ($file in $componentFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Verificar se tem import React
    if ($content -notmatch "import\s+(\*\s+as\s+)?React\s+from\s+['""]react['""]") {
        $filesSkipped++
        continue
    }
    
    # Verificar se usa React diretamente
    if (Uses-React-Directly $file.FullName) {
        Write-Host "  Mantendo (usa React diretamente): $($file.FullName)" -ForegroundColor Yellow
        $filesSkipped++
        continue
    }
    
    Write-Host "  Removendo: $($file.FullName)" -ForegroundColor Green
    Remove-React-Import $file.FullName
    $filesFixed++
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "Limpeza concluída!" -ForegroundColor Green
Write-Host "Imports removidos: $filesFixed" -ForegroundColor Green
Write-Host "Arquivos mantidos: $filesSkipped" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "Execute 'npx tsc --noEmit' para verificar se não há erros." -ForegroundColor Cyan
