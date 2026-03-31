#!/bin/bash
# Script para corrigir índice lento do Git

echo "🛑 1. Cancelando processos git..."
pkill -9 git 2>/dev/null || true

echo "🗑️  2. Removendo índice corrompido..."
rm -f .git/index .git/index.lock

echo "🔄 3. Reconstruindo índice limpo..."
git reset

echo "✅ 4. Índice reconstruído! Testando velocidade..."
time git status --short

echo ""
echo "🎯 Pronto! Agora você pode fazer o commit normalmente."
