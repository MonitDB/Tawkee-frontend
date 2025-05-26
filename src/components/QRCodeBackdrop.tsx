import { useEffect } from 'react';
import { useHttpResponse } from '../context/ResponseNotifier';

import { QRCodeSVG } from 'qrcode.react';

import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

export default function QRCodeBackdrop({
  open,
  value,
  onClose,
}: {
  open: boolean;
  value: string;
  onClose: () => void;
}) {
  const theme = useTheme();
  const { notify } = useHttpResponse();

  useEffect(() => {
    const timeoutMilliseconds: number = 7000;
    if (open) {
      const timer = setTimeout(() => {
        notify('QR Code expired! Please try again.', 'warning');
        onClose();
      }, timeoutMilliseconds);

      return () => {
        clearTimeout(timer);
      }; // Cleanup the timer if the component unmounts or open changes
    }
  }, [open, onClose]); // Dependency array ensures effect runs only when 'open' changes

  return (
    <Backdrop
      open={open}
      onClick={onClose}
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        backdropFilter: 'blur(4px)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          maxWidth: '90%',
          maxHeight: '90%',
          boxShadow: 3,
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        <QRCodeSVG value={value} />
        {/* <img
          src={base64}
          alt="Preview"
          style={{
            display: 'block',
            maxWidth: '100%',
            maxHeight: '100%',
            borderRadius: 'inherit',
            color: 'black'
          }}
        /> */}
      </Box>
    </Backdrop>
  );
}
