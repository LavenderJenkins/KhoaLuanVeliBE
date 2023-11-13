import {Global, Injectable, Logger, OnModuleInit} from '@nestjs/common';
import Redis from 'ioredis';
import {RedisKey, RetryTime, TimeToLive} from 'src/enums';

@Global()
@Injectable()
export class RedisConnectionService implements OnModuleInit {
  private redisClient: Redis;
  logger = new Logger('RedisService');

  async onModuleInit() {
    await this.connectRedis();
  }

  async connectRedis() {
    this.logger.log('Connecting to Redis...');
    let isConnected: Boolean = false;
    let retryTime = RetryTime.Init;
    const maxRetry = RetryTime.Ten;

    while (!isConnected && retryTime < maxRetry) {
      try {
        this.redisClient = new Redis(process.env.REDIS_URI);
        isConnected = true;
        this.logger.log('Connect to Redis successfully');
      } catch (error) {
        isConnected = false;
        retryTime++;
        this.logger.error(
          `Error connecting to Redis at ${retryTime} times: ${error}`,
        );
      }
    }
  }

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async set(key: string, value: any, expire: number = TimeToLive.OneMinute): Promise<boolean> {
    let replicateValue = value;
    if (typeof value !== 'string') {
      replicateValue = JSON.stringify(replicateValue);
    }
    return this.redisClient.set(key, replicateValue, 'EX', expire).then(result => result === 'OK');
  }

  async del(key: string): Promise<Boolean> {
    return this.redisClient.del(key).then(result => result === 1);
  }

  async addToSet(key: string, data: any): Promise<boolean> {
    return this.redisClient.sadd(key, data).then(result => result === 1);
  }

  async removeFromSet(key: string, data: any): Promise<boolean> {
    return this.redisClient.srem(key, data).then(result => result === 1);
  }

  async getFromSet(key: string): Promise<string[]> {
    return this.redisClient.smembers(key);
  }

  async isSetIncludes(key: string, data: any): Promise<boolean> {
    return this.redisClient.sismember(key, data).then(result => result === 1);
  }

  //Online
  async addOnlineUser(userId: string): Promise<boolean> {
    return this.redisClient.sadd(RedisKey.OnlineUsers, userId).then(result => result === 1);
  }

  async removeUserOnline(userId: string): Promise<boolean> {
    this.leaveRoom(userId);
    return this.redisClient.srem(RedisKey.OnlineUsers, userId).then(result => result === 1);
  }

  async getAllUserOnline(): Promise<string[]> {
    return this.redisClient.smembers(RedisKey.OnlineUsers);
  }

  async checkUserOnline(userId: string): Promise<boolean> {
    return this.redisClient.sismember(RedisKey.OnlineUsers, userId).then(result => result === 1);
  }

  // Chat
  async joinRoom(userId: string, conversationId: string): Promise<boolean> {
    return this.redisClient.set(`${RedisKey.UserRooms}:${userId}`, conversationId).then(result => result === "OK");
  }

  async leaveRoom(userId: string): Promise<boolean> {
    return this.redisClient.del(`${RedisKey.UserRooms}:${userId}`).then(result => result === 1);
  }
}
