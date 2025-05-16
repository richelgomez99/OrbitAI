import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTasks() {
  try {
    const tasks = await prisma.task.findMany();
    console.log('Tasks in the database:');
    console.log(JSON.stringify(tasks, null, 2));
  } catch (error) {
    console.error('Error fetching tasks:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTasks();
