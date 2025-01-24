import * as bcrypt from 'bcrypt';


export const hashPassword = async (password: string, salt: number = 10): Promise<string> => {
    return bcrypt.hash(password, salt);
};


export const validatePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
}