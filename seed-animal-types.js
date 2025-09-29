const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedAnimalTypes() {
  try {
    console.log('Seeding animal types...');
    
    const animalTypes = [
      { label: 'dog' },
      { label: 'cat' },
      { label: 'bird' },
      { label: 'rabbit' },
      { label: 'hamster' },
      { label: 'fish' },
      { label: 'turtle' },
      { label: 'snake' },
      { label: 'lizard' },
      { label: 'horse' },
      { label: 'other' }
    ];

    for (const animalType of animalTypes) {
      const existing = await prisma.animalType.findUnique({
        where: { label: animalType.label }
      });
      
      if (!existing) {
        const created = await prisma.animalType.create({
          data: animalType
        });
        console.log(`Created animal type: ${created.label} (ID: ${created.id})`);
      } else {
        console.log(`Animal type already exists: ${existing.label} (ID: ${existing.id})`);
      }
    }
    
    console.log('Animal types seeding completed!');
  } catch (error) {
    console.error('Error seeding animal types:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAnimalTypes();