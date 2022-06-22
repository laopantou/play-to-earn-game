import {
  ThirdwebNftMedia,
  useAddress,
  useOwnedNFTs,
} from "@thirdweb-dev/react";
import { EditionDrop, SmartContract } from "@thirdweb-dev/sdk";
import React from "react";
import LoadingSection from "./LoadingSection";
import styles from "../styles/Home.module.css";
import { BigNumber } from "ethers";
import { MINING_CONTRACT_ADDRESS } from "../const/contractAddresses";

type Props = {
  pickaxeContract: EditionDrop;
  miningContract: SmartContract<any>;
};

/**
 * This component shows the:
 * - Pickaxes the connected wallet has
 * - A stake button underneath each of them to equip it
 */
export default function OwnedGear({ pickaxeContract, miningContract }: Props) {
  const address = useAddress();
  const { data: ownedPickaxes, isLoading } = useOwnedNFTs(
    pickaxeContract,
    address
  );

  if (isLoading) {
    return <LoadingSection />;
  }

  async function equip(id: BigNumber) {
    if (!address) return;

    // The contract requires approval to be able to transfer the pickaxe
    const hasApproval = await pickaxeContract.isApproved(
      address,
      MINING_CONTRACT_ADDRESS
    );

    if (!hasApproval) {
      await pickaxeContract.setApprovalForAll(MINING_CONTRACT_ADDRESS, true);
    }

    await miningContract.call("stake", id);
  }

  return (
    <>
      <div className={styles.nftBoxGrid}>
        {ownedPickaxes?.map((p) => (
          <div className={styles.nftBox} key={p.metadata.id.toString()}>
            <ThirdwebNftMedia
              metadata={p.metadata}
              className={styles.nftMedia}
              height={"64"}
            />
            <h3>{p.metadata.name}</h3>
            {/* @ts-ignore */}
            <p>Quantity: {p.supply.toNumber()}</p>

            <button
              onClick={() => equip(p.metadata.id)}
              className={`${styles.mainButton} ${styles.spacerBottom}`}
            >
              Equip
            </button>
          </div>
        ))}
      </div>
    </>
  );
}