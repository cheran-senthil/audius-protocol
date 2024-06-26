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
 * @interface SupporterReference
 */
export interface SupporterReference {
    /**
     * 
     * @type {string}
     * @memberof SupporterReference
     */
    userId: string;
}

/**
 * Check if a given object implements the SupporterReference interface.
 */
export function instanceOfSupporterReference(value: object): value is SupporterReference {
    let isInstance = true;
    isInstance = isInstance && "userId" in value && value["userId"] !== undefined;

    return isInstance;
}

export function SupporterReferenceFromJSON(json: any): SupporterReference {
    return SupporterReferenceFromJSONTyped(json, false);
}

export function SupporterReferenceFromJSONTyped(json: any, ignoreDiscriminator: boolean): SupporterReference {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'userId': json['user_id'],
    };
}

export function SupporterReferenceToJSON(value?: SupporterReference | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'user_id': value.userId,
    };
}

