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
 * @interface BlobInfo
 */
export interface BlobInfo {
    /**
     * 
     * @type {number}
     * @memberof BlobInfo
     */
    size: number;
    /**
     * 
     * @type {string}
     * @memberof BlobInfo
     */
    contentType: string;
}

/**
 * Check if a given object implements the BlobInfo interface.
 */
export function instanceOfBlobInfo(value: object): value is BlobInfo {
    let isInstance = true;
    isInstance = isInstance && "size" in value && value["size"] !== undefined;
    isInstance = isInstance && "contentType" in value && value["contentType"] !== undefined;

    return isInstance;
}

export function BlobInfoFromJSON(json: any): BlobInfo {
    return BlobInfoFromJSONTyped(json, false);
}

export function BlobInfoFromJSONTyped(json: any, ignoreDiscriminator: boolean): BlobInfo {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'size': json['size'],
        'contentType': json['content_type'],
    };
}

export function BlobInfoToJSON(value?: BlobInfo | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'size': value.size,
        'content_type': value.contentType,
    };
}

