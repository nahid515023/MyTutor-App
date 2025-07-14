import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: '/api/auth/google/callback',
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await prisma.user.findFirst({
          where: { email: profile.emails![0].value }
        });
 
        console.log("profile: ", profile);
        console.log("Google auth - checking for user with email:", profile.emails![0].value);
        console.log("User found:", user);

        if (!user) {
          console.log("Creating new user for Google auth");
          // Create new user if doesn't exist
          user = await prisma.user.create({
            data: {
              name: profile.displayName,
              email: profile.emails![0].value,
              password: '', // Empty password for OAuth users
              profileImage: profile.photos![0].value,
              verified: true, // Google accounts are pre-verified
              role: 'STUDENT', // Default role
              gender: 'Not specified',
              dob: '1/1/2001'
            },
          });
          console.log("New user created:", user.id);
        }

        return done(null, user);
      } catch (error) {
        console.error("Google auth error:", error);
        return done(error as Error, undefined);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  console.log("Serializing user:", user.id);
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    console.log("Deserializing user:", id);
    const user = await prisma.user.findFirst({
      where: { id },
    });
    console.log("Deserialized user:", user);
    done(null, user);
  } catch (error) {
    console.error("Deserialize error:", error);
    done(error, null);
  }
});

export default passport; 