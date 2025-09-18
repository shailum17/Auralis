import { Module } from '@nestjs/common';
import { MlGatewayService } from './ml-gateway.service';
import { MlGatewayController } from './ml-gateway.controller';

@Module({
  providers: [MlGatewayService],
  controllers: [MlGatewayController],
  exports: [MlGatewayService],
})
export class MlGatewayModule {}