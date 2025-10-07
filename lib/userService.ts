import { prisma } from './prisma';

export async function ensureUserExists(userId: string, email?: string, displayName?: string) {
  try {
    console.log('🔍 Checking if user exists:', userId);
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (existingUser) {
      console.log('✅ User already exists:', existingUser);
      return existingUser;
    }
    
    // Create user if doesn't exist
    console.log('👤 Creating new user:', { userId, email, displayName });
    const newUser = await prisma.user.create({
      data: {
        id: userId,
        email: email || null,
        displayName: displayName || null,
        createdAt: new Date(),
      }
    });
    
    console.log('✅ User created successfully:', newUser);
    return newUser;
    
  } catch (error) {
    console.error('❌ Error ensuring user exists:', error);
    throw error;
  }
}