import { DataProvider } from './data-provider';
import { AssetAddress, DefinitionField, Transaction, UTxO } from '../../types';
import { Asset } from '../../dex/models/asset';

export class Mock extends DataProvider {

    public async utxos(address: string, asset?: Asset): Promise<UTxO[]> {
        return Promise.resolve([]);
    }

    public async assetTransactions(asset: Asset): Promise<Transaction[]> {
        return Promise.resolve([]);
    }

    public async transactionUtxos(txHash: string): Promise<UTxO[]> {
        return Promise.resolve([]);
    }

    public async assetAddresses(asset: Asset): Promise<AssetAddress[]> {
        return Promise.resolve([]);
    }

    public datumValue(datumHash: string): Promise<DefinitionField> {
        return Promise.resolve({
            constructor: 0,
            fields: [],
        });
    }

}