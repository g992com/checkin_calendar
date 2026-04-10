import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupPersonalData() {
  try {
    console.log('开始清理个人打卡数据...');
    
    // 查找所有 groupId 为 null 的任务
    const personalTasks = await prisma.task.findMany({
      where: { groupId: null }
    });
    
    if (personalTasks.length === 0) {
      console.log('没有个人打卡数据需要清理');
      return;
    }
    
    console.log(`找到 ${personalTasks.length} 条个人任务记录`);
    
    // 获取个人任务的 ID 列表
    const personalTaskIds = personalTasks.map(task => task.id);
    
    // 删除这些任务对应的打卡记录
    await prisma.checkIn.deleteMany({
      where: {
        taskId: {
          in: personalTaskIds
        }
      }
    });
    
    console.log(`删除了 ${personalTaskIds.length} 条任务对应的打卡记录`);
    
    // 删除个人任务
    await prisma.task.deleteMany({
      where: {
        groupId: null
      }
    });
    
    console.log(`删除了 ${personalTasks.length} 条个人任务记录`);
    console.log('个人打卡数据清理完成');
  } catch (error) {
    console.error('清理个人打卡数据时出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupPersonalData();