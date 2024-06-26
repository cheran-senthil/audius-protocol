/* tslint:disable */
/* eslint-disable */
// @ts-nocheck
/**
 * API
 * Audius V1 API
 *
 * The version of the OpenAPI document: 1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
import type { User } from './User';
import {
    UserFromJSON,
    UserFromJSONTyped,
    UserToJSON,
} from './User';

/**
 * 
 * @export
 * @interface FollowingResponse
 */
export interface FollowingResponse {
    /**
     * 
     * @type {Array<User>}
     * @memberof FollowingResponse
     */
    data?: Array<User>;
}

/**
 * Check if a given object implements the FollowingResponse interface.
 */
export function instanceOfFollowingResponse(value: object): value is FollowingResponse {
    let isInstance = true;

    return isInstance;
}

export function FollowingResponseFromJSON(json: any): FollowingResponse {
    return FollowingResponseFromJSONTyped(json, false);
}

export function FollowingResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): FollowingResponse {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'data': !exists(json, 'data') ? undefined : ((json['data'] as Array<any>).map(UserFromJSON)),
    };
}

export function FollowingResponseToJSON(value?: FollowingResponse | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'data': value.data === undefined ? undefined : ((value.data as Array<any>).map(UserToJSON)),
    };
}

