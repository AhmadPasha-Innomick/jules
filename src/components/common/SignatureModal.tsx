import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from "@mui/material";

interface SignatureModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (signature: string) => void;
    initialValue?: string | null;
}

const SignatureModal: React.FC<SignatureModalProps> = ({ open, onClose, onSave, initialValue }) => {
    const sigCanvasRef = useRef<SignatureCanvas>(null);
    const [error, setError] = useState<string | null>(null);

    const handleClear = () => {
        sigCanvasRef.current?.clear();
        setError(null);
    };

    const handleSave = () => {
        if (sigCanvasRef.current?.isEmpty()) {
            setError("Please provide a signature.");
            return;
        }
        const dataUrl = sigCanvasRef.current?.toDataURL("image/png");
        if (dataUrl) {
            onSave(dataUrl);
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Capture Signature</DialogTitle>
            <DialogContent>
                <Box mb={2}>
                    <Typography variant="body2" color="textSecondary">
                        Please sign in the box below:
                    </Typography>
                </Box>
                <Box
                    border={1}
                    borderColor="grey.400"
                    borderRadius={2}
                    sx={{ width: '100%', height: 200, background: '#fff' }}
                >
                    <SignatureCanvas
                        ref={sigCanvasRef}
                        penColor="black"
                        canvasProps={{ width: 400, height: 200, style: { width: '100%', height: 200, background: '#fff', borderRadius: 8 } }}
                        backgroundColor="#fff"
                        clearOnResize={false}
                    />
                </Box>
                {error && <Typography color="error" mt={1}>{error}</Typography>}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClear}>Clear</Button>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained">Save</Button>
            </DialogActions>
        </Dialog>
    );
};

export default SignatureModal;
