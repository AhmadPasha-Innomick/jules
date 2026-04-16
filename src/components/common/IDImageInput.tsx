import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Box, Typography } from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import UploadFileIcon from "@mui/icons-material/UploadFile";

interface IDImageInputProps {
    label: string;
    value: string | null;
    onChange: (img: string | null) => void;
}

const IDImageInput: React.FC<IDImageInputProps> = ({ label, value, onChange }) => {
    const [open, setOpen] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const webcamRef = useRef<Webcam>(null);

    const handleScan = () => {
        setCameraError(null);
        setOpen(true);
    };

    const handleCapture = () => {
        try {
            const imageSrc = webcamRef.current?.getScreenshot();
            if (imageSrc) {
                onChange(imageSrc);
                setOpen(false);
            } else {
                setCameraError("Failed to capture image. Please try again.");
            }
        } catch (error) {
            setCameraError("Camera access error. Please check permissions.");
            console.error("Camera capture error:", error);
        }
    };


    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            onChange(reader.result as string);
        };
        reader.readAsDataURL(file);
    };


    const handleRemove = () => onChange(null);

    return (
        <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>{label}</Typography>
            <Box display="flex" alignItems="center" gap={1}>
                <input
                    accept="image/*"
                    style={{ display: "none" }}
                    id={`upload-${label}`}
                    type="file"
                    onChange={handleUpload}
                />
                <Button
                    variant="outlined"
                    startIcon={<PhotoCameraIcon />}
                    onClick={handleScan}
                >
                    Scan
                </Button>
                <label htmlFor={`upload-${label}`}>
                    <Button
                        variant="outlined"
                        component="span"
                        startIcon={<UploadFileIcon />}
                    >
                        Upload
                    </Button>
                </label>
                {value && (
                    <Button color="error" onClick={handleRemove}>
                        Remove
                    </Button>
                )}
            </Box>
            {value && (
                <Box mt={1}>
                    <img src={value} alt={label} style={{ maxWidth: 200, borderRadius: 8, border: "1px solid #eee" }} />
                </Box>
            )}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Scan {label}</DialogTitle>
                <DialogContent>
                    {cameraError && (
                        <Typography color="error" mb={2}>{cameraError}</Typography>
                    )}
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        width="100%"
                        videoConstraints={{ facingMode: "user" }}
                        onUserMediaError={(error) => {
                            setCameraError("Camera permission denied or not available. Please check browser permissions.");
                            console.error("Webcam error:", error);
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleCapture} variant="contained" disabled={!!cameraError}>Capture</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default IDImageInput;
