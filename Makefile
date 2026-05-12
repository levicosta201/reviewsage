.DEFAULT_GOAL := help
.PHONY: help setup dev up down build rebuild logs logs-app shell \
        db-push db-migrate db-studio db-reset db-seed \
        infra-up infra-down infra-reset \
        lint typecheck clean nuke

# ──────────────────────────────────────────
# Cores
# ──────────────────────────────────────────
CYAN  := \033[0;36m
GREEN := \033[0;32m
YELLOW:= \033[0;33m
RESET := \033[0m

## ─────────────────────────────────────────────────────────────────────────────
help: ## Mostra esta ajuda
	@echo ""
	@echo "  $(CYAN)ReviewSage$(RESET) — comandos disponíveis"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(GREEN)%-20s$(RESET) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo ""

## ─────────────────────────────────────────────────────────────────────────────
## SETUP
## ─────────────────────────────────────────────────────────────────────────────

setup: ## Configura o projeto do zero (primeira vez)
	@echo "$(CYAN)→ Copiando .env.example → .env$(RESET)"
	@cp -n .env.example .env || true
	@echo "$(CYAN)→ Instalando dependências npm$(RESET)"
	npm install
	@echo "$(CYAN)→ Subindo postgres + redis$(RESET)"
	docker compose -f docker-compose.dev.yml up -d
	@echo "$(CYAN)→ Aguardando banco de dados$(RESET)"
	@sleep 5
	@echo "$(CYAN)→ Aplicando schema no banco$(RESET)"
	npm run db:push
	@echo ""
	@echo "$(GREEN)✔ Setup concluído! Rode: make dev$(RESET)"

## ─────────────────────────────────────────────────────────────────────────────
## DESENVOLVIMENTO
## ─────────────────────────────────────────────────────────────────────────────

dev: infra-up ## Sobe infra (postgres + redis) e inicia Next.js em modo dev
	@echo "$(CYAN)→ Iniciando Next.js dev server$(RESET)"
	npm run dev

infra-up: ## Sobe apenas postgres + redis (sem o app)
	docker compose -f docker-compose.dev.yml up -d
	@echo "$(GREEN)✔ Infra rodando$(RESET)"

infra-down: ## Para postgres + redis
	docker compose -f docker-compose.dev.yml down

infra-reset: ## Para + apaga volumes de dev (dados serão perdidos)
	@echo "$(YELLOW)⚠ Isso vai apagar todos os dados de desenvolvimento!$(RESET)"
	docker compose -f docker-compose.dev.yml down -v
	@echo "$(GREEN)✔ Volumes de dev removidos$(RESET)"

## ─────────────────────────────────────────────────────────────────────────────
## PRODUÇÃO (Docker Compose completo)
## ─────────────────────────────────────────────────────────────────────────────

up: ## Sobe toda a stack em produção (app + postgres + redis)
	docker compose up -d
	@echo "$(GREEN)✔ Stack rodando em http://localhost:$${APP_PORT:-3000}$(RESET)"

down: ## Para toda a stack
	docker compose down

build: ## Builda a imagem Docker do app
	docker compose build app

rebuild: ## Builda a imagem Docker sem cache
	docker compose build --no-cache app

logs: ## Segue logs de todos os serviços
	docker compose logs -f

logs-app: ## Segue logs apenas do app
	docker compose logs -f app

shell: ## Abre shell no container do app (produção)
	docker compose exec app sh

## ─────────────────────────────────────────────────────────────────────────────
## BANCO DE DADOS
## ─────────────────────────────────────────────────────────────────────────────

db-push: ## Aplica o schema Prisma no banco (dev, sem migration)
	npm run db:push

db-migrate: ## Cria e aplica uma migration Prisma
	npm run db:migrate

db-studio: ## Abre o Prisma Studio no browser
	npm run db:studio

db-reset: infra-reset ## Reinicia o banco e reaplicar o schema
	@sleep 5
	docker compose -f docker-compose.dev.yml up -d
	@sleep 5
	npm run db:push
	@echo "$(GREEN)✔ Banco reiniciado$(RESET)"

## ─────────────────────────────────────────────────────────────────────────────
## QUALIDADE
## ─────────────────────────────────────────────────────────────────────────────

lint: ## Roda ESLint
	npm run lint

typecheck: ## Verifica tipos TypeScript
	npx tsc --noEmit

## ─────────────────────────────────────────────────────────────────────────────
## LIMPEZA
## ─────────────────────────────────────────────────────────────────────────────

clean: ## Remove .next e node_modules
	rm -rf .next node_modules

nuke: down infra-reset clean ## Remove tudo (containers, volumes, build, deps)
	@echo "$(GREEN)✔ Projeto zerado$(RESET)"
