import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Nutrition, NutritionDocument } from '../../schemas/nutrition.schema';

@Injectable()
export class NutritionService {
  constructor(@InjectModel(Nutrition.name) private nutritionModel: Model<NutritionDocument>) {}

  create(data: any) {
    return this.nutritionModel.create(data);
  }

  findByUser(uid: string) {
    return this.nutritionModel.find({ user: uid }).exec();
  }

  update(id: string, data: any) {
    return this.nutritionModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  remove(id: string) {
    return this.nutritionModel.findByIdAndDelete(id).exec();
  }
}
