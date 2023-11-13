import {createParamDecorator, ExecutionContext, HttpStatus, SetMetadata} from '@nestjs/common';

import {JwtService} from '@nestjs/jwt';
import {ExceptionResponse} from "../exceptions/common.exception";
import {DEVICE_METADATA} from "../constants";

export const GetUserIdFromToken = createParamDecorator<string>(async (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const jwt = new JwtService();
    const bearer = request.headers.authorization;
    if (!bearer) {
        throw new ExceptionResponse(HttpStatus.UNAUTHORIZED, 'Xác thực thất bại!');
    }
    const token = bearer.split(' ')[1];
    const payload: any = jwt.decode(token);
    if (!payload || !payload.userId) {
        throw new ExceptionResponse(HttpStatus.UNAUTHORIZED, 'Xác thực thất bại!');
    }
    return payload.userId;
});

export const GetToken = createParamDecorator<string>(async (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const bearer = request?.headers?.authorization;

    if (!bearer) {
        throw new ExceptionResponse(HttpStatus.UNAUTHORIZED, 'Xác thực thất bại!');
    }
    return bearer.split(' ')[1];
});

export const LoginMetadata = () => SetMetadata(DEVICE_METADATA, true);
