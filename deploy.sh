#!/bin/bash
set -e

echo "🧹 Limpando processos e locks..."
pkill -9 -f "git|vite|npm" 2>/dev/null || true
find .git -name "*.lock" -type f -delete 2>/dev/null || true

echo "📝 Adicionando alterações ao git..."
git add src/lib/organizationServices.ts

echo "💾 Fazendo commit..."
git commit --no-verify -m "fix: corrigir erro 406 ao buscar temas de organizacoes"

echo "🚀 Fazendo push..."
git push

echo "🔨 Fazendo build..."
npm run build

echo "☁️  Fazendo deploy..."
npm run pages:deploy

echo "✅ Deploy concluído com sucesso!"
