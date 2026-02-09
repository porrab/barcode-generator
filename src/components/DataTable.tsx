import React, { useState, forwardRef, useImperativeHandle } from "react";
import { type AssetData } from "../types";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Chip,
  IconButton,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import Barcode from "react-barcode";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

export interface DataTableHandle {
  openAddForm: () => void;
}

interface Props {
  data: AssetData[];
  onAdd: (item: AssetData) => void;
  onEdit: (index: number, item: AssetData) => void;
  onDelete: (index: number) => void;
}

const initialFormState: AssetData = {
  No: "",
  "Staff ID": "",
  "Full Name": "",
  "Organization Name": "",
};

export const DataTable = forwardRef<DataTableHandle, Props>(
  ({ data, onAdd, onEdit, onDelete }, ref) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selected, setSelected] = useState<number[]>([]);

    // Dialog State
    const [openDialog, setOpenDialog] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [formData, setFormData] = useState<AssetData>(initialFormState);

    useImperativeHandle(ref, () => ({
      openAddForm: () => {
        handleOpenAdd();
      },
    }));

    const handleChangePage = (_event: unknown, newPage: number) => {
      setPage(newPage);
    };

    const handleChangeRowsPerPage = (
      event: React.ChangeEvent<HTMLInputElement>,
    ) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };

    const getRealIndex = (localIndex: number) =>
      page * rowsPerPage + localIndex;

    const currentData = data.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage,
    );

    // --- Handlers for Dialog ---

    const handleOpenAdd = () => {
      setEditingIndex(null);
      setFormData(initialFormState);
      setOpenDialog(true);
    };

    const handleOpenEdit = (localIndex: number) => {
      const realIndex = getRealIndex(localIndex);
      setEditingIndex(realIndex);
      setFormData(data[realIndex]);
      setOpenDialog(true);
    };

    const handleCloseDialog = () => {
      setOpenDialog(false);
    };

    const handleSave = () => {
      if (!formData["Staff ID"] || !formData["Full Name"]) {
        alert("Please fill in Staff ID and Name");
        return;
      }

      if (editingIndex !== null) {
        onEdit(editingIndex, formData);
      } else {
        onAdd({
          ...formData,
          No: data.length + 1,
        });
      }
      handleCloseDialog();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectRow = (index: number) => {
      setSelected((prev) =>
        prev.includes(index)
          ? prev.filter((i) => i !== index)
          : [...prev, index],
      );
    };

    const handleSelectAll = (checked: boolean) => {
      if (checked) {
        setSelected(currentData.map((_item, idx) => idx));
      } else {
        setSelected([]);
      }
    };

    return (
      <>
        <Paper sx={{ width: "100%", overflow: "hidden", mt: 2, mb: 2 }}>
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={
                        selected.length > 0 &&
                        selected.length < currentData.length
                      }
                      checked={
                        currentData.length > 0 &&
                        selected.length === currentData.length
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                    No.
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                    Staff ID
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                    Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                    Organization
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                    Barcode
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", bgcolor: "#f5f5f5" }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentData.map((item, index) => {
                  const realIndex = getRealIndex(index) + 1;
                  const isChecked = selected.includes(index);
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isChecked}
                          onChange={() => handleSelectRow(index)}
                        />
                      </TableCell>
                      <TableCell>{Number(item.No) || realIndex}</TableCell>
                      <TableCell>
                        <Chip
                          label={item["Staff ID"]}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{item["Full Name"]}</TableCell>
                      <TableCell>{item["Organization Name"]}</TableCell>
                      <TableCell>
                        <Barcode
                          value={`${item["Organization Name"]} ${item["Staff ID"]} ${item["Full Name"]}`}
                          width={1}
                          height={30}
                          fontSize={14}
                          displayValue={false}
                          margin={0}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            aria-label="edit"
                            color="primary"
                            onClick={() => handleOpenEdit(index)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            aria-label="delete"
                            color="error"
                            onClick={() => onDelete(getRealIndex(index))}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {currentData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No Data. Click "Add Item" to start.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={data.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>

        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            {editingIndex !== null ? "Edit Asset" : "Add New Asset"}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Staff ID"
                name="Staff ID"
                value={formData["Staff ID"]}
                onChange={handleInputChange}
                fullWidth
                required
              />
              <TextField
                label="Full Name"
                name="Full Name"
                value={formData["Full Name"]}
                onChange={handleInputChange}
                fullWidth
                required
              />
              <TextField
                label="Organization Name"
                name="Organization Name"
                value={formData["Organization Name"]}
                onChange={handleInputChange}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="inherit">
              Cancel
            </Button>
            <Button onClick={handleSave} variant="contained" color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  },
);

DataTable.displayName = "DataTable";
