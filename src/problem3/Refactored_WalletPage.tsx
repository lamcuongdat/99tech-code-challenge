import React, {useMemo} from 'react';
import {BoxProps} from 'BoxProps'; // Assuming BoxProps is defined in BoxProps file
import {useWalletBalances, usePrices} from 'my-hooks'; // Assuming these hooks are defined in my-hooks


/*
* Types and interfaces definition
*/
interface WalletBalance {
    currency: string;
    amount: number;
    // Adding missing properties to match the original code
    blockchain: string;
}
// Extending WalletBalance to reuse currency; amount and blockchain properties for type safety
interface FormattedWalletBalance extends WalletBalance {
    formatted: string;
    // Usd value should be calculated once while mapping/creating the formatted balances so it can be used directly in the WalletRow component
    usdValue: number;
}

interface Props extends BoxProps {
    // Adding rowClassName to allow custom styling of rows
    rowClassName?: string;
}

// Assuming BlockchainPriority is a fixed value mapping for different blockchains
enum BlockchainPriority {
    Osmosis = 100,
    Ethereum = 50,
    Arbitrum = 30,
    Zilliqa = 20,
    Neo = 20,
    Unknown = -99
}

// Defining a type for Blockchain based on the BlockchainPriority enum for type safety
type Blockchain = keyof typeof BlockchainPriority;

// Defining the WalletRowProps type to match the expected props for the WalletRow component based on the original code
type WalletRowProps = {
    className: string;
    amount: number;
    usdValue: number;
    formattedAmount: string;
    key: string;
};
/*
* Helper functions
*/
// Utilize TypeScript's type assertion to ensure the blockchain is one of the defined Blockchain types
// Pull out the getPriority function to a separate function to keep the component clean
const getPriority = (blockchain: string): number => {
    return BlockchainPriority[blockchain as Blockchain] ?? BlockchainPriority.Unknown;
}

/*
* Functional components
*/
function WalletRow(props: WalletRowProps) {
    let {className, amount, usdValue, formattedAmount, key} = props;
    // key is used to uniquely identify each row to optimize rendering
    return <div className={className} key={key}>
        <span>{amount}</span>
        <span>{formattedAmount}</span>
        <span>${usdValue.toFixed(2)}</span>
    </div>;
}

const WalletPage: React.FC<Props> = (props: Props) => {
    // Rules of hooks: useWalletBalances and usePrices should be called at the top level of the component
    const balances = useWalletBalances();
    const prices = usePrices();

    // Remove redundant children as WalletPage does not render children directly
    // Add rowClassName to allow custom styling of rows
    const {rowClassName, ...rest} = props;

    // Filtering, formatting, and sorting balances based on priority and amount can be done in a single loop
    const sortedAndFormattedBalances: FormattedWalletBalance[] = useMemo(() => {
        return balances.filter((balance: WalletBalance) => {
            const balancePriority = getPriority(balance.blockchain);
            // Change the logic to filter out balances with balance is not UNKNOWN and amount is greater than 0
            return balancePriority > -99 && balance.amount > 0;
        })
            .map((balance: WalletBalance) => {
                return {
                    ...balance,
                    // Using toFixed(6) to format the amount to be consistent with the problem2
                    formatted: balance.amount.toFixed(6),
                    usdValue: prices[balance.currency] * balance.amount
                }
            })
            .sort((lhs: WalletBalance, rhs: WalletBalance) => {
                const leftPriority = getPriority(lhs.blockchain);
                const rightPriority = getPriority(rhs.blockchain);
                if (leftPriority > rightPriority) {
                    return -1;
                } else if (leftPriority < rightPriority) {
                    return 1;
                } else {
                    // If priorities are equal, sort by amount descending
                    return rhs.amount - lhs.amount;
                }
            });
        // getPriority does not need to put in the dependency array as it is a pure function
        // prices is necessary to calculate the usdValue of each balance
    }, [balances, prices]);

    const rows = sortedAndFormattedBalances.map(balance =>
        <WalletRow
            className={rowClassName ? rowClassName : 'wallet-row'}
            // Using index may cause unexpected behavior if the list changes
            // Using a combination of currency and blockchain as a key to ensure uniqueness instead
            key={`${balance.currency}-${balance.blockchain}`}
            amount={balance.amount}
            usdValue={balance.usdValue}
            formattedAmount={balance.formatted}
        />)

    return (
        <div {...rest}>
            {rows}
        </div>
    )
}

// Exporting the WalletPage component as default
export default WalletPage;