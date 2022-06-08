import { Modal } from "@mui/material";
import { MintingPaper } from "../collections/CreateCollectionForm";
import ConnectWallet from "./ConnectWallet";

export default function ConnectWalletModal({ opened, handleClose }) {

    return <Modal open={opened} onClose={handleClose}>
        <div>
            <MintingPaper>
                <ConnectWallet withWrapper fullButton></ConnectWallet>
            </MintingPaper>
        </div>
    </Modal>

}