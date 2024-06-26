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
import type { UserFull } from './UserFull';
import {
    UserFullFromJSON,
    UserFullFromJSONTyped,
    UserFullToJSON,
} from './UserFull';

/**
 * 
 * @export
 * @interface FullRemix
 */
export interface FullRemix {
    /**
     * 
     * @type {string}
     * @memberof FullRemix
     */
    parentTrackId: string;
    /**
     * 
     * @type {UserFull}
     * @memberof FullRemix
     */
    user: UserFull;
    /**
     * 
     * @type {boolean}
     * @memberof FullRemix
     */
    hasRemixAuthorReposted: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof FullRemix
     */
    hasRemixAuthorSaved: boolean;
}

/**
 * Check if a given object implements the FullRemix interface.
 */
export function instanceOfFullRemix(value: object): value is FullRemix {
    let isInstance = true;
    isInstance = isInstance && "parentTrackId" in value && value["parentTrackId"] !== undefined;
    isInstance = isInstance && "user" in value && value["user"] !== undefined;
    isInstance = isInstance && "hasRemixAuthorReposted" in value && value["hasRemixAuthorReposted"] !== undefined;
    isInstance = isInstance && "hasRemixAuthorSaved" in value && value["hasRemixAuthorSaved"] !== undefined;

    return isInstance;
}

export function FullRemixFromJSON(json: any): FullRemix {
    return FullRemixFromJSONTyped(json, false);
}

export function FullRemixFromJSONTyped(json: any, ignoreDiscriminator: boolean): FullRemix {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'parentTrackId': json['parent_track_id'],
        'user': UserFullFromJSON(json['user']),
        'hasRemixAuthorReposted': json['has_remix_author_reposted'],
        'hasRemixAuthorSaved': json['has_remix_author_saved'],
    };
}

export function FullRemixToJSON(value?: FullRemix | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'parent_track_id': value.parentTrackId,
        'user': UserFullToJSON(value.user),
        'has_remix_author_reposted': value.hasRemixAuthorReposted,
        'has_remix_author_saved': value.hasRemixAuthorSaved,
    };
}

