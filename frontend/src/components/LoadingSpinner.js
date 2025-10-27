import { Backdrop, CircularProgress } from '@mui/material';

const LoadingSpinner = ({ open }) => (
  <Backdrop open={open} sx={{ zIndex: 9999 }}>
    <CircularProgress color="primary" />
  </Backdrop>
); 