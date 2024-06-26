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
/**
 * 
 * @export
 * @interface TagsResponse
 */
export interface TagsResponse {
    /**
     * 
     * @type {Array<string>}
     * @memberof TagsResponse
     */
    data?: Array<string>;
}

/**
 * Check if a given object implements the TagsResponse interface.
 */
export function instanceOfTagsResponse(value: object): value is TagsResponse {
    let isInstance = true;

    return isInstance;
}

export function TagsResponseFromJSON(json: any): TagsResponse {
    return TagsResponseFromJSONTyped(json, false);
}

export function TagsResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): TagsResponse {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'data': !exists(json, 'data') ? undefined : json['data'],
    };
}

export function TagsResponseToJSON(value?: TagsResponse | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'data': value.data,
    };
}

