import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NutritionService } from './nutrition.service';
import { NutritionController } from './nutrition.controller';
import { Nutrition, NutritionSchema } from '../../schemas/nutrition.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Nutrition.name, schema: NutritionSchema }])],
  providers: [NutritionService],
  controllers: [NutritionController],
})
export class NutritionModule {}
