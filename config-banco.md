npm install

# Configurar .env
DATABASE_URL="..."

# Executar migrations
npx prisma migrate deploy

# Popular banco
npm run seed

# Iniciar aplicação
npm run dev
