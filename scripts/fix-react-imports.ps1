# Script para adicionar imports de React em arquivos TSX
# Corrige o warning: 'React' refers to a UMD global

Write-Host "Iniciando correção de imports React..." -ForegroundColor Green

# Contador de arquivos corrigidos
$filesFixed = 0
$filesSkipped = 0

# Função para verificar se o arquivo já tem import React
function Has-ReactImport {
    param($filePath)
    
    $content = Get-Content $filePath -Raw
    return $content -match "import\s+.*React.*\s+from\s+['""]react['""]"
}

# Função para verificar se o arquivo usa JSX
function Uses-JSX {
    param($filePath)
    
    $content = Get-Content $filePath -Raw
    # Verifica se tem tags JSX (componentes começam com maiúscula)
    return $content -match "<[A-Z][a-zA-Z0-9]*"
}

# Função para adicionar import React
function Add-ReactImport {
    param($filePath)
    
    $content = Get-Content $filePath -Raw
    
    # Adicionar import no início do arquivo, após 'use client' se existir
    if ($content -match "^'use client'") {
        $newContent = $content -replace "^('use client')", "`$1`n`nimport React from 'react'"
    } else {
        $newContent = "import React from 'react'`n`n" + $content
    }
    
    Set-Content -Path $filePath -Value $newContent -NoNewline
}

# Processar arquivos .tsx em app/
Write-Host "`nProcessando arquivos em app/..." -ForegroundColor Cyan
$appFiles = Get-ChildItem -Path "app" -Filter "*.tsx" -Recurse -File

foreach ($file in $appFiles) {
    if (Has-ReactImport $file.FullName) {
        Write-Host "  Pulando (já tem import): $($file.FullName)" -ForegroundColor Gray
        $filesSkipped++
        continue
    }
    
    if (Uses-JSX $file.FullName) {
        Write-Host "  Corrigindo: $($file.FullName)" -ForegroundColor Yellow
        Add-ReactImport $file.FullName
        $filesFixed++
    } else {
        Write-Host "  Pulando (não usa JSX): $($file.FullName)" -ForegroundColor Gray
        $filesSkipped++
    }
}

# Processar arquivos .tsx em components/
Write-Host "`nProcessando arquivos em components/..." -ForegroundColor Cyan
$componentFiles = Get-ChildItem -Path "components" -Filter "*.tsx" -Recurse -File

foreach ($file in $componentFiles) {
    if (Has-ReactImport $file.FullName) {
        Write-Host "  Pulando (já tem import): $($file.FullName)" -ForegroundColor Gray
        $filesSkipped++
        continue
    }
    
    if (Uses-JSX $file.FullName) {
        Write-Host "  Corrigindo: $($file.FullName)" -ForegroundColor Yellow
        Add-ReactImport $file.FullName
        $filesFixed++
    } else {
        Write-Host "  Pulando (não usa JSX): $($file.FullName)" -ForegroundColor Gray
        $filesSkipped++
    }
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "Correção concluída!" -ForegroundColor Green
Write-Host "Arquivos corrigidos: $filesFixed" -ForegroundColor Green
Write-Host "Arquivos pulados: $filesSkipped" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "Execute 'npx tsc --noEmit' para verificar se os erros foram corrigidos." -ForegroundColor Cyan
