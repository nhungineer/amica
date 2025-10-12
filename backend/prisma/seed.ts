import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create test users
  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      id: '5648f6b3-f335-4c13-a09e-821ff8db6d8a',
      email: 'alice@example.com',
      name: 'Alice',
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      id: '9ca01e21-9725-4fed-a44c-0262c704c8a6',
      email: 'bob@example.com',
      name: 'Bob',
    },
  });

  const charlie = await prisma.user.upsert({
    where: { email: 'charlie@example.com' },
    update: {},
    create: {
      id: '7c932a32-2c6e-4f7b-96e8-f45efc77065d',
      email: 'charlie@example.com',
      name: 'Charlie',
    },
  });

  console.log('✅ Seeded users:', { alice, bob, charlie });
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
