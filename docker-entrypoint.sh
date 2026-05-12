#!/bin/sh
set -e

echo "→ Aguardando banco de dados..."
until npx prisma db push --skip-generate 2>/dev/null; do
  echo "  Banco não disponível, tentando em 2s..."
  sleep 2
done

echo "→ Banco pronto. Iniciando aplicação..."
exec "$@"
