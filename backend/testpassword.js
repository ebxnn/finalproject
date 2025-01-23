import bcrypt from 'bcryptjs';
import argon2 from 'argon2';

const testPassword = async () => {
    const hardcodedPassword = 'password123';
    const hardcodedHash = await argon2.hash(hardcodedPassword);
    const isMatch = await argon2.verify(hardcodedHash, hardcodedPassword);
    console.log('Hardcoded password match:', isMatch);
    
};

testPassword();
