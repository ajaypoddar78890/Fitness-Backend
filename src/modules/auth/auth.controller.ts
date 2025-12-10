import { 
  Body, 
  Controller, 
  Post, 
  Get,
  Put,
  HttpException, 
  HttpStatus, 
  UseGuards, 
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { FirebaseService } from '../../services/firebase.service';
import { UsersService } from '../users/users.service';
import { 
  SignupDto, 
  LoginDto, 
  FirebaseLoginDto, 
  UpdateProfileDto,
  UpdateFitnessProfileDto 
} from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private firebaseService: FirebaseService,
    private usersService: UsersService
  ) {}

  // Test endpoint for connectivity checks
  @Get('test')
  async testConnection() {
    return {
      status: 'ok',
      message: 'Backend server is running',
      timestamp: new Date().toISOString(),
    };
  }

  // Traditional Email/Password Registration
  @Post('register')
  @UsePipes(new ValidationPipe({ transform: true }))
  async register(@Body() signupDto: SignupDto) {
    console.log('🔥 Registration request received:', {
      email: signupDto.email,
      name: signupDto.name,
      hasPassword: !!signupDto.password
    });
    
    try {
      const result = await this.authService.register(signupDto);
      console.log('✅ Registration successful for:', signupDto.email);
      return result;
    } catch (error) {
      console.error('❌ Registration failed for:', signupDto.email, error.message);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Registration failed',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  // Traditional Email/Password Login
  @Post('login')
  @UsePipes(new ValidationPipe({ transform: true }))
  async login(@Body() loginDto: LoginDto) {
    console.log('🔐 Login request received:', {
      email: loginDto.email,
      hasPassword: !!loginDto.password
    });
    
    try {
      const result = await this.authService.login(loginDto);
      console.log('✅ Login successful for:', loginDto.email);
      return result;
    } catch (error) {
      console.error('❌ Login failed for:', loginDto.email, error.message);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Login failed',
        HttpStatus.UNAUTHORIZED
      );
    }
  }

  // Logout
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req) {
    console.log('👋 Logout request received for user:', req.user.email);
    
    try {
      // You can add token blacklisting logic here if needed
      // For now, we'll just log the logout activity
      
      console.log('✅ Logout successful for user:', req.user.email);
      return {
        message: 'Logout successful',
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ Logout failed for user:', req.user.email, error.message);
      throw new HttpException(
        'Logout failed',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Firebase Authentication (Google/Social Login)
  @Post('firebase-login')
  @UsePipes(new ValidationPipe({ transform: true }))
  async firebaseLogin(@Body() firebaseLoginDto: FirebaseLoginDto) {
    try {
      const decodedToken = await this.firebaseService.verifyIdToken(firebaseLoginDto.idToken);
      return await this.authService.firebaseLogin(decodedToken);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Firebase authentication failed',
        HttpStatus.UNAUTHORIZED
      );
    }
  }

  // Verify Firebase Token (for testing)
  @Post('verify-firebase-token')
  async verifyFirebaseToken(@Body() body: { idToken: string }) {
    try {
      const decodedToken = await this.firebaseService.verifyIdToken(body.idToken);
      return {
        message: 'Token verified successfully',
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
        picture: decodedToken.picture,
      };
    } catch (error) {
      throw new HttpException('Invalid Firebase token', HttpStatus.UNAUTHORIZED);
    }
  }

  // Get Profile (JWT Guard)
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    console.log('📡 Auth profile request. req.user:', req.user);
    try {
      // Use uid from JWT if present, otherwise fall back to known fields
      const identifier = req.user?.uid || req.user?.sub || req.user?.id || req.user?.email;
      console.log(`🔍 Looking up profile by identifier: ${identifier}`);
      return await this.authService.getProfile(identifier);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Profile not found', HttpStatus.NOT_FOUND);
    }
  }

  // Get Profile (Firebase Guard - alternative)
  @Get('firebase-profile')
  @UseGuards(FirebaseAuthGuard)
  async getFirebaseProfile(@Request() req) {
    try {
      const firebaseUser = await this.firebaseService.getUserByUid(req.user.uid);
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        emailVerified: firebaseUser.emailVerified,
      };
    } catch (error) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }

  // Update Profile
  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    try {
      return await this.authService.updateProfile(req.user.uid, updateProfileDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Profile update failed',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  // Get Fitness Profile
  @Get('profile/fitness')
  @UseGuards(JwtAuthGuard)
  async getFitnessProfile(@Request() req) {
    console.log('📋 Fitness profile request received for user:', req.user?.email || req.user?.uid);
    
    try {
      const result = await this.authService.getFitnessProfile(req.user.uid);
      console.log('✅ Fitness profile retrieved for:', req.user?.email || req.user?.uid);
      return result;
    } catch (error) {
      console.error('❌ Fitness profile retrieval failed for:', req.user?.email || req.user?.uid, error.message);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to get fitness profile',
        HttpStatus.NOT_FOUND
      );
    }
  }

  // Update Fitness Profile
  @Put('profile/fitness')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateFitnessProfile(@Request() req, @Body() updateFitnessProfileDto: UpdateFitnessProfileDto) {
    console.log('🏋️ Fitness profile update request received for user:', req.user.email);
    console.log('🏋️ Profile data:', updateFitnessProfileDto);
    
    try {
      const result = await this.authService.updateFitnessProfile(req.user.uid, updateFitnessProfileDto);
      console.log('✅ Fitness profile updated successfully for:', req.user.email);
      return result;
    } catch (error) {
      console.error('❌ Fitness profile update failed for:', req.user.email, error.message);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Fitness profile update failed',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  // Change Password
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Request() req,
    @Body() body: { currentPassword: string; newPassword: string }
  ) {
    try {
      return await this.authService.changePassword(
        req.user.uid,
        body.currentPassword,
        body.newPassword
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Password change failed',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  // Deactivate Account
  @Post('deactivate')
  @UseGuards(JwtAuthGuard)
  async deactivateAccount(@Request() req) {
    try {
      return await this.authService.deactivateAccount(req.user.uid);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Account deactivation failed',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  // Migration endpoint to fix existing users without UID (run once)
  @Post('migrate-users')
  async migrateUsers() {
    try {
      const result = await this.authService.migrateUsersWithoutUID();
      return result;
    } catch (error) {
      throw new HttpException(
        'Migration failed',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Legacy endpoints for backward compatibility
  @Post('register-legacy')
  async registerLegacy(@Body() body: { email: string; password: string; name?: string }) {
    try {
      // Create user in Firebase (if needed)
      const firebaseUser = await this.firebaseService.createUser(body.email, body.password, body.name);
      
      // Also register in local MongoDB
      const mongoUser = await this.authService.register({
        email: body.email,
        password: body.password,
        name: body.name || body.email.split('@')[0],
      });
      
      return {
        message: 'User registered successfully',
        firebaseUid: firebaseUser.uid,
        user: mongoUser.user,
      };
    } catch (error) {
      throw new HttpException(error.message || 'Registration failed', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('login-legacy')
  async loginLegacy(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    return this.authService.login_legacy(user);
  }
}
