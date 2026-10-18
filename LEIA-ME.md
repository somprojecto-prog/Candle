# Instalação (corre na raiz do projeto)

1. Copiar estas pastas para o projeto (app/, lib/orders/, prisma/).
   NÃO copiar o lib/constants.ts do zip do cliente por cima do existente.
2. npm i zod @prisma/client@6 && npm i -D prisma@6
3. Criar .env com:
   DATABASE_URL="file:./dev.db"
   ORDER_UNIT_PRICE=0        (troca pelo preço real, em euros)
4. Acrescentar ao .gitignore: .env e prisma/*.db
5. npx prisma migrate dev --name init
6. npm run dev  -> testar /encomenda e /manager
