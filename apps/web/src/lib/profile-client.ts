// Mock profile client since auth system is removed

export const profileClient = {
  async updatePersonalInfo(data: any) {
    console.log('Mock: updatePersonalInfo called with:', data);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In a real implementation, this would save to database
    // For now, we'll simulate success and return the updated data
    return {
      success: true,
      data: { 
        message: 'Profile updated successfully (mock)',
        user: data, // Return the updated data
        savedToDatabase: true,
        method: 'mock-api'
      },
      error: null
    };
  },

  async getPersonalInfo(userId: string) {
    console.log('Mock: getPersonalInfo called for user:', userId);
    return {
      success: true,
      data: {
        fullName: 'Guest User',
        email: 'guest@example.com',
        username: 'guest',
        bio: 'This is a mock user profile',
        academicInfo: {
          institution: 'Mock University',
          major: 'Computer Science'
        },
        interests: ['Technology', 'Learning']
      }
    };
  },

  async uploadProfileImage(file: File) {
    console.log('Mock: uploadProfileImage called');
    return {
      success: true,
      data: { imageUrl: '/placeholder-avatar.jpg' }
    };
  }
};