import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MuscleGroup, MuscleGroupSchema } from '../../schemas/muscle-group.schema';
import { MuscleGroupsService } from './muscle-groups.service';
import { MuscleGroupsController } from './muscle-groups.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MuscleGroup.name, schema: MuscleGroupSchema }]),
  ],
  providers: [MuscleGroupsService],
  controllers: [MuscleGroupsController],
})
export class MuscleGroupsModule {}
