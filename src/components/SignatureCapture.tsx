import ClearIcon from "@mui/icons-material/Clear";
import SaveIcon from "@mui/icons-material/Save";
import { Box, Button, Paper, Typography } from "@mui/material";
import { useRef, useState, useCallback, useEffect } from "react";

interface SignatureCaptureProps {
  onSave: (signatureData: string) => void;
  onCancel: () => void;
  width?: number;
  height?: number;
  label?: string;
  initialSignature?: string;
}

/**
 * Component for capturing digital signatures using canvas
 */
function SignatureCapture({
  onSave,
  onCancel,
  width = 500,
  height = 200,
  label = "Sign here",
  initialSignature,
}: SignatureCaptureProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(!initialSignature);

  // Clear canvas function
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    setIsEmpty(true);
  }, []);

  // Initialize canvas context and load initial signature if provided
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas context properties
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#000";

    // If there's an initial signature, load it
    if (initialSignature) {
      // Create image element for loading the signature
      const img = document.createElement("img");
      img.onload = () => {
        if (ctx) {
          // Clear first
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          // Draw the image
          ctx.drawImage(img, 0, 0);
          setIsEmpty(false);
        }
      };
      img.onerror = (err) => {
        console.error("Error loading initial signature:", err);
        clearCanvas();
      };
      img.src = initialSignature;
    } else {
      console.log("No initial signature, clearing canvas");
      clearCanvas();
    }
  }, [initialSignature, clearCanvas]);

  // Helper to get coordinates from mouse or touch event
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return null;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // Get coordinates based on event type
    if ("clientX" in e) {
      // Mouse event
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }

    if (e.touches?.[0]) {
      // Touch event
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }

    return null;
  };

  // Handle mouse/touch events
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);

    // Get coordinates
    const coords = getCoordinates(e);
    if (coords) {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Get coordinates and draw line
    const coords = getCoordinates(e);
    if (coords) {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
      setIsEmpty(false);
    }
  };

  const stopDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(false);
    ctx.closePath();
  };

  // Save the signature as data URL
  const saveSignature = () => {
    console.log("Save signature clicked. Canvas ref:", !!canvasRef.current, "isEmpty:", isEmpty);

    if (!canvasRef.current) {
      console.log("No canvas reference found");
      return;
    }

    if (isEmpty) {
      onSave("");
      return;
    }

    try {
      const dataUrl = canvasRef.current.toDataURL("image/png");
      console.log("Generated signature data URL, length:", dataUrl.length);
      onSave(dataUrl);
    } catch (err) {
      console.error("Error generating signature data URL:", err);
    }
  };

  return (
    <Box sx={{ width: width, maxWidth: "100%" }}>
      <Typography variant="subtitle1" mb={1}>
        {label}
      </Typography>
      <Paper
        elevation={3}
        sx={{
          p: 2,
          mb: 2,
          position: "relative",
          border: "2px solid #3f51b5",
          borderRadius: 1,
          backgroundColor: "#f9f9f9",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Typography variant="subtitle2" sx={{ color: "#3f51b5", fontWeight: "bold" }}>
            Draw your signature below:
          </Typography>
          <Typography
            variant="caption"
            sx={{
              display: "inline-block",
              bgcolor: "#e3f2fd",
              px: 1,
              py: 0.5,
              borderRadius: 1,
              border: "1px dashed #2196f3",
            }}
          >
            Click and drag to sign
          </Typography>
        </Box>

        <Box
          sx={{
            position: "relative",
            border: "1px solid #3f51b5",
            borderRadius: "4px",
            backgroundColor: "#fff",
            overflow: "hidden",
            boxShadow: "inset 0 0 5px rgba(0,0,0,0.1)",
          }}
        >
          {isEmpty && !initialSignature && (
            <Typography
              variant="body-sm"
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                color: "#aaa",
                pointerEvents: "none", // Make sure this doesn't interfere with canvas events
              }}
            >
              Draw here
            </Typography>
          )}
          <canvas
            ref={canvasRef}
            width={width - 20} // Account for padding
            height={height}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            style={{
              touchAction: "none", // Prevent scrolling while drawing on mobile
              cursor: "crosshair",
              display: "block", // Remove any spacing issues
            }}
          />
        </Box>
      </Paper>

      <Box display="flex" justifyContent="space-between">
        <Button variant="outlined" color="error" startIcon={<ClearIcon />} onClick={clearCanvas}>
          Clear
        </Button>
        <Box>
          <Button variant="outlined" onClick={onCancel} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={saveSignature}
            sx={{
              fontWeight: "bold",
              bgcolor: "#3f51b5",
              "&:hover": { bgcolor: "#303f9f" },
              px: 2,
            }}
          >
            Save Signature
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default SignatureCapture;
