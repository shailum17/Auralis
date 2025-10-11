import { IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateNotificationPreferencesDto {
    @ApiProperty({
        required: false,
        example: true,
        description: 'Enable email notifications'
    })
    @IsOptional()
    @IsBoolean()
    emailNotifications?: boolean;

    @ApiProperty({
        required: false,
        example: true,
        description: 'Enable push notifications'
    })
    @IsOptional()
    @IsBoolean()
    pushNotifications?: boolean;

    @ApiProperty({
        required: false,
        example: true,
        description: 'Enable message notifications'
    })
    @IsOptional()
    @IsBoolean()
    messageNotifications?: boolean;

    @ApiProperty({
        required: false,
        example: true,
        description: 'Enable post reaction notifications'
    })
    @IsOptional()
    @IsBoolean()
    postReactions?: boolean;

    @ApiProperty({
        required: false,
        example: true,
        description: 'Enable comment reply notifications'
    })
    @IsOptional()
    @IsBoolean()
    commentReplies?: boolean;

    @ApiProperty({
        required: false,
        example: true,
        description: 'Enable study group invite notifications'
    })
    @IsOptional()
    @IsBoolean()
    studyGroupInvites?: boolean;

    @ApiProperty({
        required: false,
        example: true,
        description: 'Enable session reminder notifications'
    })
    @IsOptional()
    @IsBoolean()
    sessionReminders?: boolean;

    @ApiProperty({
        required: false,
        example: true,
        description: 'Enable wellness alert notifications'
    })
    @IsOptional()
    @IsBoolean()
    wellnessAlerts?: boolean;

    @ApiProperty({
        required: false,
        example: true,
        description: 'Enable moderation action notifications'
    })
    @IsOptional()
    @IsBoolean()
    moderationActions?: boolean;

    @ApiProperty({
        required: false,
        example: true,
        description: 'Enable system announcement notifications'
    })
    @IsOptional()
    @IsBoolean()
    systemAnnouncements?: boolean;
}