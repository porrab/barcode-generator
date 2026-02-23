import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export type ModalType = "success" | "error" | "warning" | "info" | "confirm";

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
  type?: ModalType;
  title: string;
  message: React.ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const getModalConfig = (type: ModalType) => {
  switch (type) {
    case "success":
      return {
        icon: <CheckCircleOutlineIcon color="success" sx={{ fontSize: 48 }} />,
        color: "success.main",
      };
    case "error":
      return {
        icon: <ErrorOutlineIcon color="error" sx={{ fontSize: 48 }} />,
        color: "error.main",
      };
    case "warning":
      return {
        icon: <WarningAmberIcon color="warning" sx={{ fontSize: 48 }} />,
        color: "warning.main",
      };
    case "info":
      return {
        icon: <InfoOutlinedIcon color="info" sx={{ fontSize: 48 }} />,
        color: "info.main",
      };
    case "confirm":
      return {
        icon: <WarningAmberIcon color="primary" sx={{ fontSize: 48 }} />,
        color: "primary.main",
      };
    default:
      return { icon: null, color: "text.primary" };
  }
};

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  open,
  onClose,
  type = "info",
  title,
  message,
  onConfirm,
  confirmText = "OK",
  cancelText = "Cancel",
}) => {
  const { icon, color } = getModalConfig(type);

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pt: 4,
          pb: 2,
        }}
      >
        {icon}
      </Box>
      <DialogTitle
        sx={{ textAlign: "center", color, fontWeight: "bold", pb: 1 }}
      >
        {title}
      </DialogTitle>
      <DialogContent sx={{ textAlign: "center" }}>
        <Typography variant="body1" color="text.secondary">
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", pb: 3, px: 3, gap: 1 }}>
        {type === "confirm" && (
          <Button
            onClick={onClose}
            variant="outlined"
            color="inherit"
            fullWidth
          >
            {cancelText}
          </Button>
        )}
        <Button
          onClick={handleConfirm}
          variant="contained"
          color={
            type === "error"
              ? "error"
              : type === "warning"
                ? "warning"
                : type === "success"
                  ? "success"
                  : "primary"
          }
          fullWidth
          disableElevation
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
