import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from "@mui/material";
import { type AssetData } from "../types";

interface EditAssetModalProps {
  open: boolean;
  onClose: () => void;
  asset: AssetData | null;
  onSave: (updatedAsset: AssetData) => Promise<void>;
}

export const EditAssetModal: React.FC<EditAssetModalProps> = ({
  open,
  onClose,
  asset,
  onSave,
}) => {
  const [formData, setFormData] = useState<AssetData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (asset) {
      setFormData(asset);
    }
  }, [asset]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold" }}>Edit Asset Data</DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Staff ID"
              name="staffID"
              value={formData.staffID}
              disabled
              fullWidth
              helperText="ไม่สามารถแก้ไขรหัสพนักงานได้ (Primary Key)"
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="No."
                name="no"
                value={formData.no}
                onChange={handleChange}
                sx={{ width: "30%" }}
              />
              <TextField
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                fullWidth
                required
              />
            </Box>

            <TextField
              label="Organization Name"
              name="organizationName"
              value={formData.organizationName}
              onChange={handleChange}
              fullWidth
              required
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} color="inherit" disabled={isSaving}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
