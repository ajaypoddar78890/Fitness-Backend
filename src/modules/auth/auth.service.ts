import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../schemas/user.schema';
import { SignupDto, LoginDto, UpdateProfileDto, UpdateFitnessProfileDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService
  ) {}

  // Traditional Email/Password Registration
  async register(signupDto: SignupDto) {
    const { email, password, name, photo } = signupDto;
    
    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate unique UID
    const uid = this.generateUID();

    // Create new user
    const newUser = new this.userModel({
      email,
      password: hashedPassword,
      name,
      photo,
      uid,
      authProvider: 'email',
      isActive: true,
    });

    const savedUser = await newUser.save();

    // Generate tokens
    const tokens = await this.generateTokens(savedUser);

    return {
      message: 'User registered successfully',
      user: savedUser.toJSON(),
      ...tokens,
    };
  }

  // Traditional Email/Password Login
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user and include password for validation
    const user = await this.userModel.findOne({ 
      email: email.toLowerCase(),
      isActive: true 
    }).select('+password');

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      message: 'Login successful',
      user: user.toJSON(),
      ...tokens,
    };
  }

  // Firebase Authentication (for Google/Social logins)
  async firebaseLogin(decodedToken: any) {
    const { uid, email, name, picture, firebase } = decodedToken;

    // Find or create user based on Firebase UID
    let user = await this.userModel.findOne({ 
      $or: [
        { firebaseUid: uid },
        { email: email }
      ],
      isActive: true 
    });

    if (user) {
      // Update existing user with Firebase UID if not set
      if (!user.firebaseUid) {
        user.firebaseUid = uid;
        user.authProvider = 'firebase';
        if (picture && !user.photo) user.photo = picture;
        if (name && !user.name) user.name = name;
      }
      user.lastLogin = new Date();
      await user.save();
    } else {
      // Create new user from Firebase auth
      const randomPassword = Math.random().toString(36).slice(-12);
      const hashedPassword = await bcrypt.hash(randomPassword, 12);

      user = new this.userModel({
        email: email || undefined,
        password: hashedPassword, // Random password for schema compliance
        name: name || email?.split('@')[0] || 'User',
        photo: picture,
        uid: this.generateUID(),
        firebaseUid: uid,
        authProvider: 'firebase',
        isActive: true,
        lastLogin: new Date(),
      });

      await user.save();
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      message: 'Firebase login successful',
      user: user.toJSON(),
      ...tokens,
    };
  }

  // Generate JWT tokens
  private async generateTokens(user: UserDocument) {
    // Generate UID if user doesn't have one (for existing users)
    if (!user.uid) {
      user.uid = this.generateUID();
      await user.save();
      console.log('🆔 Generated UID for existing user:', user.email, '- UID:', user.uid);
    }

    const payload = { 
      uid: user.uid, // Use the custom uid field
      email: user.email,
      name: user.name,
      authProvider: user.authProvider 
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    return { accessToken, refreshToken };
  }

  // Generate unique UID
  private generateUID(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 15);
    return `uid_${timestamp}_${random}`;
  }

  // Validate user (for JWT strategy)
  async validateUser(email: string, password: string) {
    const user = await this.userModel.findOne({ 
      email: email.toLowerCase(),
      isActive: true 
    }).select('+password');
    
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

    return user.toJSON();
  }

  // Get user profile
  private isObjectId(value: string) {
    return !!value && /^[a-fA-F0-9]{24}$/.test(value);
  }

  async getProfile(userId: string) {
    // Accept either a MongoDB ObjectId or the custom UID from the JWT payload
    let user;
    if (this.isObjectId(userId)) {
      user = await this.userModel.findById(userId).select('-password').exec();
    } else {
      user = await this.userModel.findOne({ uid: userId, isActive: true }).select('-password').exec();
    }
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.toJSON();
  }

  // Update user profile
  async updateProfile(userId: string, updateData: UpdateProfileDto) {
    // Update by custom uid field (JWT provides uid) instead of Mongo ObjectId
    let user;
    if (this.isObjectId(userId)) {
      user = await this.userModel.findByIdAndUpdate(userId, { $set: updateData }, { new: true, runValidators: true }).select('-password');
    } else {
      user = await this.userModel.findOneAndUpdate({ uid: userId }, { $set: updateData }, { new: true, runValidators: true }).select('-password');
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'Profile updated successfully',
      user: user.toJSON(),
    };
  }

  // Change password
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    // Find by uid
    let user = null;
    if (this.isObjectId(userId)) {
      user = await this.userModel.findById(userId).select('+password');
    } else {
      user = await this.userModel.findOne({ uid: userId }).select('+password');
    }
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedNewPassword;
    await user.save();

    return { message: 'Password changed successfully' };
  }

  // Deactivate account
  async deactivateAccount(userId: string) {
    // Deactivate by custom uid
    let user;
    if (this.isObjectId(userId)) {
      user = await this.userModel.findByIdAndUpdate(userId, { isActive: false }, { new: true });
    } else {
      user = await this.userModel.findOneAndUpdate({ uid: userId }, { isActive: false }, { new: true });
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { message: 'Account deactivated successfully' };
  }

  // Get Fitness Profile
  async getFitnessProfile(uid: string) {
    const user = await this.userModel.findOne({ uid, isActive: true });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'Fitness profile retrieved successfully',
      profile: user.profile || {},
      user: {
        uid: user.uid,
        email: user.email,
        name: user.name
      }
    };
  }

  // Update Fitness Profile
  async updateFitnessProfile(uid: string, updateFitnessProfileDto: UpdateFitnessProfileDto) {
    console.log('🔍 Searching for user with UID:', uid);
    
    let user;
    
    // If UID is undefined/null, try to find by email in JWT payload
    if (!uid || uid === 'undefined') {
      // This is a fallback for old users without UID
      console.log('⚠️ UID is undefined, this might be an old user without UID');
      throw new BadRequestException('User UID is missing. Please login again to get a new token with UID.');
    }
    
    user = await this.userModel.findOne({ uid, isActive: true });
    
    if (!user) {
      console.log('❌ User not found with UID:', uid);
      throw new NotFoundException('User not found');
    }

    console.log('👤 Found user:', { uid: user.uid, email: user.email });
    console.log('📊 Current profile:', user.profile);
    console.log('📝 Update data:', updateFitnessProfileDto);

    // Update the profile object
    const updatedProfile = {
      ...user.profile,
      ...updateFitnessProfileDto
    };

    console.log('🔄 Updated profile:', updatedProfile);

    // Update user with new profile data
    const updatedUser = await this.userModel.findOneAndUpdate(
      { uid, isActive: true },
      { profile: updatedProfile },
      { new: true }
    );

    console.log('💾 User updated in database:', updatedUser?.uid);
    console.log('💾 Final profile in database:', updatedUser?.profile);

    return {
      message: 'Fitness profile updated successfully',
      user: updatedUser.toJSON(),
      profile: updatedProfile
    };
  }

  // Migration method to add UIDs to existing users
  async migrateUsersWithoutUID() {
    console.log('🔄 Starting migration for users without UID...');
    
    const usersWithoutUID = await this.userModel.find({ 
      $or: [
        { uid: { $exists: false } },
        { uid: null },
        { uid: '' }
      ]
    });

    console.log(`📊 Found ${usersWithoutUID.length} users without UID`);

    let migratedCount = 0;
    for (const user of usersWithoutUID) {
      user.uid = this.generateUID();
      await user.save();
      console.log(`✅ Generated UID for user: ${user.email} -> ${user.uid}`);
      migratedCount++;
    }

    console.log(`🎉 Migration completed! ${migratedCount} users updated.`);
    
    return {
      message: 'Migration completed successfully',
      totalUsers: usersWithoutUID.length,
      migratedUsers: migratedCount
    };
  }

  // For legacy compatibility
  async login_legacy(user: any) {
    const payload = { uid: user._id.toString(), email: user.email };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }
}
