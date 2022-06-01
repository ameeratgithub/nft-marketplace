import { Alert, Snackbar } from "@mui/material"

export default function CustomAlert({ message, isOpen, onClose, type }){
    return <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'center' }} open={isOpen}
        onClose={onClose} autoHideDuration={6000}>
        <Alert onClose={onClose} severity={type ? type : 'info'} sx={{ width: '100%' }}>
            {message}
        </Alert>
    </Snackbar>
}