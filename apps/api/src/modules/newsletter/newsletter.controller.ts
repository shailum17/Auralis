import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { NewsletterService } from './newsletter.service';

class SubscribeDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

class UnsubscribeDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  token: string;
}

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  async subscribe(@Body() subscribeDto: SubscribeDto) {
    try {
      const { email } = subscribeDto;

      if (!email) {
        throw new HttpException('Email is required', HttpStatus.BAD_REQUEST);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new HttpException('Invalid email format', HttpStatus.BAD_REQUEST);
      }

      const result = await this.newsletterService.subscribeToNewsletter(email);

      return {
        success: true,
        message: 'Successfully subscribed to newsletter! Check your email for confirmation.',
        data: result,
      };
    } catch (error: any) {
      console.error('Newsletter subscription error:', error);
      
      if (error.message === 'Email already subscribed') {
        throw new HttpException(
          'This email is already subscribed to our newsletter',
          HttpStatus.CONFLICT
        );
      }

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to subscribe to newsletter. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('unsubscribe')
  async unsubscribe(@Body() unsubscribeDto: UnsubscribeDto) {
    try {
      const { email, token } = unsubscribeDto;

      if (!email || !token) {
        throw new HttpException(
          'Email and token are required',
          HttpStatus.BAD_REQUEST
        );
      }

      await this.newsletterService.unsubscribeFromNewsletter(email, token);

      return {
        success: true,
        message: 'Successfully unsubscribed from newsletter',
      };
    } catch (error: any) {
      console.error('Newsletter unsubscribe error:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to unsubscribe. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
