/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LoginResponse } from '../models/LoginResponse';
import type { RefreshRequest } from '../models/RefreshRequest';
import type { RefreshResponse } from '../models/RefreshResponse';
import type { TgAuthData } from '../models/TgAuthData';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * Authenticate using Telegram Web App data
     * Authenticates the user using Telegram Web App data and returns JWT tokens
     * @param requestBody
     * @returns LoginResponse Successful authentication
     * @throws ApiError
     */
    public static login(
        requestBody: TgAuthData,
    ): CancelablePromise<LoginResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request`,
                401: `Invalid Telegram data or signature`,
            },
        });
    }
    /**
     * Refresh access token using refresh token
     * Generates a new access token using a valid refresh token
     * @param requestBody
     * @returns RefreshResponse New access token generated
     * @throws ApiError
     */
    public static refresh(
        requestBody: RefreshRequest,
    ): CancelablePromise<RefreshResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/refresh',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request`,
                401: `Invalid or expired refresh token`,
            },
        });
    }
}
