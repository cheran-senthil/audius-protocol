/* tslint:disable */
/* eslint-disable */
// @ts-nocheck
/**
 * API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface Repost
 */
export interface Repost {
    /**
     * 
     * @type {string}
     * @memberof Repost
     */
    repostItemId: string;
    /**
     * 
     * @type {string}
     * @memberof Repost
     */
    repostType: string;
    /**
     * 
     * @type {string}
     * @memberof Repost
     */
    userId: string;
}

/**
 * Check if a given object implements the Repost interface.
 */
export function instanceOfRepost(value: object): value is Repost {
    let isInstance = true;
    isInstance = isInstance && "repostItemId" in value && value["repostItemId"] !== undefined;
    isInstance = isInstance && "repostType" in value && value["repostType"] !== undefined;
    isInstance = isInstance && "userId" in value && value["userId"] !== undefined;

    return isInstance;
}

export function RepostFromJSON(json: any): Repost {
    return RepostFromJSONTyped(json, false);
}

export function RepostFromJSONTyped(json: any, ignoreDiscriminator: boolean): Repost {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'repostItemId': json['repost_item_id'],
        'repostType': json['repost_type'],
        'userId': json['user_id'],
    };
}

export function RepostToJSON(value?: Repost | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'repost_item_id': value.repostItemId,
        'repost_type': value.repostType,
        'user_id': value.userId,
    };
}

