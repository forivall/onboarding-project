import * as crypto from 'crypto';
import {
  IVerifyOptions,
  Strategy as BearerStrategy,
} from 'passport-http-bearer';
import { Strategy as AnonyousStrategy } from 'passport-anonymous';
import * as jose from 'jose';
import { UserInfoData, UserSecretData } from './db';
import { AsyncHandler } from './types';

/** Just an identifier for this application */
export const magicUri = 'urn:10kc:onboarding-photo-sharing';
const pbkdf2Iterations = 10000; // arbitrarily chosen

export const bearerStrategy = new BearerStrategy((token, done) => {
  verifyBearer(token).then((result) => {
    done(null, result.user, result.options);
  }, done);
});

export const anonymousStrategy = new AnonyousStrategy();

type AsyncVerifyReturn = { user: any; options?: string | IVerifyOptions };
async function verifyBearer(token: string): Promise<AsyncVerifyReturn> {
  // TODO: cache secret buffer
  const secret = Buffer.from(process.env.JWT_SECRET);
  const verified = await jose.jwtVerify(token, secret, {
    audience: magicUri,
    issuer: magicUri,
  });
  return {
    user: verified.payload,
  };
}

// really, should be using oidc style token, but it's quicker to make up stuff
// rather than look up and implement the standard
export async function createLoginToken(user: UserInfoData) {
  // TODO: cache secret buffer
  const secret = Buffer.from(process.env.JWT_SECRET);
  const jwt = await new jose.SignJWT({
    username: user.username,
  })
    .setIssuedAt()
    .setIssuer(magicUri)
    .setAudience(magicUri)
    .setSubject(user.email)
    .setExpirationTime('2h') // TODO: refresh tokens would be nice
    .sign(secret);
  return jwt;
}

// for top level security, lifetime of the password in memory should be carefully managed
export async function setPassword(password: string): Promise<UserSecretData> {
  // NOTE: could use a promisified version, depends on coding standards, etc.
  const salt = await new Promise<Buffer>((resolve, reject) => {
    crypto.randomBytes(256, (err, buf) => {
      if (err) {
        reject(err);
      } else {
        resolve(buf);
      }
    });
  });
  const key = await hashPassword(password, salt);
  return { salt, key };
}

export async function hashPassword(
  password: string,
  salt: Buffer
): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    crypto.pbkdf2(
      password,
      salt,
      pbkdf2Iterations,
      256,
      'sha512',
      (err, derivedKey) => {
        if (err) {
          reject(err);
        } else {
          resolve(derivedKey);
        }
      }
    );
  });
}

/**
 * For routes that allow anonymous access (listing public photos),
 * add a header to indicate if the user's token is valid
 */
export const isLoggedInMiddleware: AsyncHandler = async (req, res, next) => {
  res.set('X-Is-Logged-In', req.user ? 'true' : 'false');
  next();
};
