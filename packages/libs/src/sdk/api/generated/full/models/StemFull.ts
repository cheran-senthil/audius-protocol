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
 * @interface StemFull
 */
export interface StemFull {
    /**
     * 
     * @type {string}
     * @memberof StemFull
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof StemFull
     */
    parentId: string;
    /**
     * 
     * @type {string}
     * @memberof StemFull
     */
    category: string;
    /**
     * 
     * @type {string}
     * @memberof StemFull
     */
    cid: string;
    /**
     * 
     * @type {string}
     * @memberof StemFull
     */
    userId: string;
    /**
     * 
     * @type {number}
     * @memberof StemFull
     */
    blocknumber: number;
    /**
     * 
     * @type {string}
     * @memberof StemFull
     */
    origFilename: string;
}

/**
 * Check if a given object implements the StemFull interface.
 */
export function instanceOfStemFull(value: object): value is StemFull {
    let isInstance = true;
    isInstance = isInstance && "id" in value && value["id"] !== undefined;
    isInstance = isInstance && "parentId" in value && value["parentId"] !== undefined;
    isInstance = isInstance && "category" in value && value["category"] !== undefined;
    isInstance = isInstance && "cid" in value && value["cid"] !== undefined;
    isInstance = isInstance && "userId" in value && value["userId"] !== undefined;
    isInstance = isInstance && "blocknumber" in value && value["blocknumber"] !== undefined;
    isInstance = isInstance && "origFilename" in value && value["origFilename"] !== undefined;

    return isInstance;
}

export function StemFullFromJSON(json: any): StemFull {
    return StemFullFromJSONTyped(json, false);
}

export function StemFullFromJSONTyped(json: any, ignoreDiscriminator: boolean): StemFull {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': json['id'],
        'parentId': json['parent_id'],
        'category': json['category'],
        'cid': json['cid'],
        'userId': json['user_id'],
        'blocknumber': json['blocknumber'],
        'origFilename': json['orig_filename'],
    };
}

export function StemFullToJSON(value?: StemFull | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'id': value.id,
        'parent_id': value.parentId,
        'category': value.category,
        'cid': value.cid,
        'user_id': value.userId,
        'blocknumber': value.blocknumber,
        'orig_filename': value.origFilename,
    };
}

