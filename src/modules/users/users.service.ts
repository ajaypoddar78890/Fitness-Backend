import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findByUid(uid: string) {
    if (!uid) return null;
    return this.userModel.findOne({ uid }).select('-password').exec();
  }

  async findById(id: string) {
    return this.userModel.findById(id).select('-password').exec();
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async updateProfile(id: string, updates: Partial<User>) {
    return this.userModel.findByIdAndUpdate(id, updates, { new: true }).select('-password');
  }

  // Find a user by Firebase decoded token info (email or firebaseUid), or create one in MongoDB.
  async findOrCreateFromFirebase(decodedToken: { uid: string; email?: string; name?: string; picture?: string }) {
    const { uid, email, name, picture } = decodedToken as any;

    // Prefer lookup by firebase uid stored in `firebaseUid` field, fallback to email
    let user = await this.userModel.findOne({ firebaseUid: uid }).exec();

    if (!user && email) {
      user = await this.userModel.findOne({ email }).exec();
    }

    if (user) {
      // If we found by email but firebaseUid is missing, update it
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
        if (name) user.name = user.name || name;
        if (picture) user.photo = user.photo || picture;
        await user.save();
      }
      return user;
    }

    // Create a new user record in MongoDB. Provide a random password hash so
    // the required `password` field in the schema is satisfied. Firebase handles authentication.
    const random = Math.random().toString(36).slice(-12);
    const hash = await bcrypt.hash(random, 10);

    const created = new this.userModel({
      email: email || undefined,
      name: name || undefined,
      photo: picture || undefined,
      firebaseUid: uid,
      password: hash,
    });

    return created.save();
  }
}
