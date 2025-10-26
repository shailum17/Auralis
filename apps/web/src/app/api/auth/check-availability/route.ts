import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for the request
const checkAvailabilitySchema = z.object({
  type: z.enum(['email', 'username']),
  value: z.string().min(1, 'Value is required'),
});

// Mock database for demonstration - replace with actual database calls
const mockUsers = [
  { email: 'john@example.com', username: 'john_doe' },
  { email: 'jane@example.com', username: 'jane_smith' },
  { email: 'admin@example.com', username: 'admin' },
  { email: 'test@example.com', username: 'testuser' },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = checkAvailabilitySchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          isAvailable: false,
          message: 'Invalid request format',
          error: validationResult.error.errors[0]?.message,
        },
        { status: 400 }
      );
    }

    const { type, value } = validationResult.data;
    const normalizedValue = value.toLowerCase().trim();

    // Simulate database lookup delay
    await new Promise(resolve => setTimeout(resolve, 300));

    let isAvailable = true;
    let message = '';
    let suggestions: string[] = [];

    if (type === 'email') {
      // Check if email exists in mock database
      const existingUser = mockUsers.find(user => user.email.toLowerCase() === normalizedValue);
      
      if (existingUser) {
        isAvailable = false;
        message = 'An account with this email address already exists';
      } else {
        message = 'Email address is available';
      }
    } else if (type === 'username') {
      // Check if username exists in mock database
      const existingUser = mockUsers.find(user => user.username.toLowerCase() === normalizedValue);
      
      if (existingUser) {
        isAvailable = false;
        message = 'This username is already taken';
        
        // Generate suggestions
        suggestions = generateUsernameSuggestions(normalizedValue);
      } else {
        message = 'Username is available';
      }
    }

    return NextResponse.json({
      isAvailable,
      message,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    });

  } catch (error) {
    console.error('Check availability error:', error);
    
    return NextResponse.json(
      {
        isAvailable: true, // Fail open - assume available if we can't check
        message: 'Unable to verify availability at this time',
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * Generate username suggestions when the requested username is taken
 */
function generateUsernameSuggestions(baseUsername: string): string[] {
  const suggestions: string[] = [];
  
  // Add numbers
  for (let i = 1; i <= 5; i++) {
    suggestions.push(`${baseUsername}${i}`);
  }
  
  // Add random numbers
  for (let i = 0; i < 3; i++) {
    const randomNum = Math.floor(Math.random() * 1000);
    suggestions.push(`${baseUsername}${randomNum}`);
  }
  
  // Add underscores with numbers
  suggestions.push(`${baseUsername}_1`);
  suggestions.push(`${baseUsername}_${Math.floor(Math.random() * 100)}`);
  
  // Add prefixes
  suggestions.push(`the_${baseUsername}`);
  suggestions.push(`user_${baseUsername}`);
  
  // Filter out duplicates and return first 5
  return Array.from(new Set(suggestions)).slice(0, 5);
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}