import prisma from './lib/prisma';

async function checkPages() {
  try {
    console.log('🔍 Checking Static Pages...\n');
    
    const pages = await prisma.staticPage.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`📄 Total static pages: ${pages.length}\n`);
    
    if (pages.length === 0) {
      console.log('❌ No static pages found!');
    } else {
      console.log('📄 Static Pages:');
      pages.forEach(page => {
        console.log(`  - ID ${page.id}: ${page.title}`);
        console.log(`    Slug: ${page.slug}`);
        console.log(`    Created: ${page.createdAt}`);
        console.log(`    Active: ${page.active}`);
        console.log();
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPages();
