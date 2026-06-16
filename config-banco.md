npm install

# Configurar .env
DATABASE_URL="..."

# Executar migrations
npx prisma migrate deploy --schema src/lib/prisma/schema.prisma

# Popular banco
npx prisma db seed

# Iniciar aplicação
npm run dev
