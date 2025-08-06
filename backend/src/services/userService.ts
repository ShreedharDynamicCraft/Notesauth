import prisma from '../lib/prisma';

interface UserData {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  provider?: string;
  providerId?: string;
}

export const userService = {
  async createOrUpdateUser(userData: UserData) {
    console.log('User data received:', JSON.stringify(userData, null, 2));
    
    const existingUser = await prisma.user.findUnique({
      where: { id: userData.id }
    });

    if (existingUser) {
      console.log('Updating existing user:', userData.id);
      const updatedUser = await prisma.user.update({
        where: { id: userData.id },
        data: {
          email: userData.email,
          name: userData.name,
          firstName: userData.firstName,
          lastName: userData.lastName,
          imageUrl: userData.imageUrl,
          provider: userData.provider,
          providerId: userData.providerId,
          lastSignedIn: new Date(),
        }
      });
      console.log('User updated successfully:', updatedUser);
      return updatedUser;
    }

    console.log('Creating new user:', userData.id);
    const newUser = await prisma.user.create({
      data: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        firstName: userData.firstName,
        lastName: userData.lastName,
        imageUrl: userData.imageUrl,
        provider: userData.provider,
        providerId: userData.providerId,
        lastSignedIn: new Date(),
      }
    });
    console.log('User created successfully:', newUser);
    return newUser;
  },

  async getUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        notes: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  },

  async getUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email }
    });
  },

  async updateLastSignIn(id: string) {
    return await prisma.user.update({
      where: { id },
      data: { lastSignedIn: new Date() }
    });
  }
};
