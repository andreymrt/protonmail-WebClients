import { OpenPGPKey } from 'pmcrypto';
import { Address, DecryptedKey, Key, UserModel } from '@proton/shared/lib/interfaces';

export interface KeyReactivationRequestStateData {
    id: string;
    Key: Key;
    key?: OpenPGPKey;
    fingerprint: string;
    uploadedPrivateKey?: OpenPGPKey;
    result?: 'ok' | Error;
}

export type KeyReactivationRequestState =
    | {
          user: UserModel;
          address: undefined;
          keys: DecryptedKey[];
          keysToReactivate: KeyReactivationRequestStateData[];
      }
    | {
          user: undefined;
          address: Address;
          keys: DecryptedKey[];
          keysToReactivate: KeyReactivationRequestStateData[];
      };

export type KeyReactivationRequest =
    | {
          user: UserModel;
          address?: undefined;
          keys: DecryptedKey[];
          keysToReactivate: Key[];
      }
    | {
          user?: undefined;
          address: Address;
          keys: DecryptedKey[];
          keysToReactivate: Key[];
      };
