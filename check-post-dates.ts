import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPostDates() {
  const post43 = await prisma.post.findUnique({ where: { id: 43 } });
  const post44 = await prisma.post.findUnique({ where: { id: 44 } });
  const post45 = await prisma.post.findUnique({ where: { id: 45 } });

  console.log('Post 43:', {
    id: post43?.id,
    title: post43?.title,
    publishedAt: post43?.publishedAt?.toISOString().split('T')[0]
  });

  console.log('Post 44:', {
    id: post44?.id,
    title: post44?.title,
    publishedAt: post44?.publishedAt?.toISOString().split('T')[0]
  });

  console.log('Post 45:', {
    id: post45?.id,
    title: post45?.title,
    publishedAt: post45?.publishedAt?.toISOString().split('T')[0]
  });

  await prisma.$disconnect();
}

checkPostDates();
