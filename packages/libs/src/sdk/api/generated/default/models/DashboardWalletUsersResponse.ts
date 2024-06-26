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
import type { DashboardWalletUser } from './DashboardWalletUser';
import {
    DashboardWalletUserFromJSON,
    DashboardWalletUserFromJSONTyped,
    DashboardWalletUserToJSON,
} from './DashboardWalletUser';

/**
 * 
 * @export
 * @interface DashboardWalletUsersResponse
 */
export interface DashboardWalletUsersResponse {
    /**
     * 
     * @type {Array<DashboardWalletUser>}
     * @memberof DashboardWalletUsersResponse
     */
    data?: Array<DashboardWalletUser>;
}

/**
 * Check if a given object implements the DashboardWalletUsersResponse interface.
 */
export function instanceOfDashboardWalletUsersResponse(value: object): value is DashboardWalletUsersResponse {
    let isInstance = true;

    return isInstance;
}

export function DashboardWalletUsersResponseFromJSON(json: any): DashboardWalletUsersResponse {
    return DashboardWalletUsersResponseFromJSONTyped(json, false);
}

export function DashboardWalletUsersResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): DashboardWalletUsersResponse {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'data': !exists(json, 'data') ? undefined : ((json['data'] as Array<any>).map(DashboardWalletUserFromJSON)),
    };
}

export function DashboardWalletUsersResponseToJSON(value?: DashboardWalletUsersResponse | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'data': value.data === undefined ? undefined : ((value.data as Array<any>).map(DashboardWalletUserToJSON)),
    };
}

