import { LiquidityPool } from './models/liquidity-pool';
import { BaseDataProvider } from '../providers/data/base-data-provider';
import { Asset, Token } from './models/asset';
import { AssetBalance, DatumParameters, PayToAddress, SwapFee, UTxO } from '../types';
import { DatumParameterKey } from '../constants';
import { tokensMatch } from '../utils';
import { BaseApi } from './api/base-api';

export abstract class BaseDex {

    /**
     * Unique name for the DEX.
     */
    public abstract readonly name: string;

    /**
     * API connection for the DEX.
     */
    public abstract readonly api: BaseApi;

    /**
     * Fetch all liquidity pools matching assetA & assetB.
     */
    abstract liquidityPools(provider: BaseDataProvider, assetA: Token, assetB?: Token): Promise<LiquidityPool[]>;

    /**
     * Craft liquidity pool state from a valid UTxO given the matching assetA & assetB.
     */
    abstract liquidityPoolFromUtxo(utxo: UTxO, assetA: Token, assetB: Token): LiquidityPool | undefined;

    /**
     * Estimated swap out amount received for a swap in token & amount on a liquidity pool.
     */
    abstract estimatedReceive(liquidityPool: LiquidityPool, swapInToken: Token, swapInAmount: bigint): bigint;

    /**
     * Calculated price impact after for swap order.
     */
    abstract priceImpactPercent(liquidityPool: LiquidityPool, swapInToken: Token, swapInAmount: bigint): number;

    /**
     * Craft a swap order for this DEX.
     */
    abstract buildSwapOrder(swapParameters: DatumParameters): Promise<PayToAddress[]>;

    /**
     * Craft a swap order cancellation for this DEX.
     */
    abstract buildCancelSwapOrder(txOutputs: UTxO[], returnAddress: string): Promise<PayToAddress[]>;

    /**
     * Fees associated with submitting a swap order.
     */
    abstract swapOrderFees(): SwapFee[];

    /**
     * Adjust the payment for the DEX order address to include the swap in amount.
     */
    protected buildSwapOrderPayment(swapParameters: DatumParameters, orderPayment: PayToAddress): PayToAddress {
        const swapInAmount: bigint = swapParameters[DatumParameterKey.SwapInAmount] as bigint;
        const swapInToken: Token = swapParameters[DatumParameterKey.SwapInTokenPolicyId]
            ? new Asset(
                swapParameters[DatumParameterKey.SwapInTokenPolicyId] as string,
                swapParameters[DatumParameterKey.SwapInTokenAssetName] as string,
            )
            : 'lovelace';

        let assetBalance: AssetBalance | undefined = orderPayment.assetBalances.find((payment: AssetBalance) => {
            return tokensMatch(payment.asset, swapInToken);
        });

        if (! assetBalance) {
            orderPayment.assetBalances.push({
                asset: swapInToken,
                quantity: swapInAmount,
            });
        } else {
            assetBalance.quantity += swapInAmount;
        }

        return orderPayment;
    }

}