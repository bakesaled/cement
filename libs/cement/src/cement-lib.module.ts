import { Module } from '@nestjs/common';
import { CementLibService } from './cement-lib.service';

@Module({
  providers: [CementLibService],
  exports: [CementLibService],
})
export class CementLibModule {}
