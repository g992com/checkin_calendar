import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupAllData() {
  try {
    console.log('开始清理所有数据...');
    
    // 删除所有数据，按照外键依赖关系的顺序删除
    await prisma.checkIn.deleteMany();
    console.log('删除了所有打卡记录');
    
    await prisma.task.deleteMany();
    console.log('删除了所有任务');
    
    await prisma.groupMember.deleteMany();
    console.log('删除了所有组成员关系');
    
    await prisma.group.deleteMany();
    console.log('删除了所有组');
    
    await prisma.user.deleteMany();
    console.log('删除了所有用户');
    
    console.log('所有数据清理完成');
  } catch (error) {
    console.error('清理所有数据时出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupAllData();