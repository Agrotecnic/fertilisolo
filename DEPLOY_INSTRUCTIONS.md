# Comandos para Deploy - FertiliSolo
# Execute estes comandos UM POR VEZ em um terminal NOVO (fora do Cursor)

## Passo 1: Navegar para o projeto
cd /Users/deyvidbueno/Documents/AppDev/fertilisolo

## Passo 2: Limpar processos travados
pkill -9 -f "git" 2>/dev/null || true
rm -f .git/index.lock .git/HEAD.lock

## Passo 3: Adicionar alterações
git add src/lib/organizationServices.ts

## Passo 4: Fazer commit
git commit -m "fix: corrigir erro 406 ao buscar temas de organizacoes"

## Passo 5: Push
git push

## Passo 6: Build
npm run build

## Passo 7: Deploy (escolha um)
npm run pages:deploy  # Para Cloudflare Pages
# OU
# vercel --prod  # Para Vercel
# OU
# netlify deploy --prod  # Para Netlify

---

## ⚡ EXECUÇÃO RÁPIDA (Script Automático):
# Execute este comando para fazer tudo de uma vez:
./deploy.sh

---

## 🆘 Se ainda travar:
1. Reinicie o computador
2. Abra um terminal NOVO (não use o terminal do Cursor)
3. Execute os comandos acima um por um
4. Se continuar travando, pode ser problema de:
   - Antivírus bloqueando
   - Sistema de arquivos corrompido
   - Hooks do Git mal configurados

## ✅ O que JÁ está pronto:
- ✅ Tema atualizado no banco de dados Supabase
- ✅ Código corrigido (src/lib/organizationServices.ts)
- ✅ Usuários associados à organização
