import React, { useRef, useState, useCallback } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';

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
const SignatureCapture: React.FC<SignatureCaptureProps> = ({
  onSave,
  onCancel,
  width = 500,
  height = 200,
  label = 'Sign here',
  initialSignature,
}) => {
  const canvasRef = useRef<any>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(!initialSignature);

  // Clear canvas function
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    setIsEmpty(true);
  }, []);

  // Initialize canvas context and load initial signature if provided
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas context properties
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000';

    // If there's an initial signature, load it
    if (initialSignature) {
      const img = new Image();
      img.onload = () => {
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          setIsEmpty(false);
        }
      };
      img.src = initialSignature;
    } else {
      clearCanvas();
    }
  }, [initialSignature, clearCanvas]);

  // Handle mouse/touch events
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
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

    const ctx = canvas.getContext('2d');
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

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(false);
    ctx.closePath();
  };

  // Helper to get coordinates from mouse or touch event
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return null;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // Get coordinates based on event type
    if ('clientX' in e) {
      // Mouse event
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    } else if (e.touches && e.touches[0]) {
      // Touch event
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }

    return null;
  };

  // Save the signature as data URL
  const saveSignature = () => {
    if (!canvasRef.current || isEmpty) return;

    const dataUrl = canvasRef.current.toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <Box sx={{ width: width, maxWidth: '100%' }}>
      <Typography variant="subtitle1" mb={1}>
        {label}
      </Typography>
      <Paper
        elevation={2}
        sx={{
          p: 1,
          mb: 2,
          position: 'relative',
          border: '1px solid #ddd',
          borderRadius: 1,
          backgroundColor: '#f9f9f9',
        }}
      >
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
            touchAction: 'none', // Prevent scrolling while drawing on mobile
            cursor: 'crosshair',
            border: '1px solid #eee',
            borderRadius: '4px',
            backgroundColor: '#fff',
          }}
        />
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
            disabled={isEmpty}
          >
            Save Signature
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default SignatureCapture;
