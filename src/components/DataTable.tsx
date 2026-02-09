import React, { useState } from "react";
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
} from "@mui/material";
import Barcode from "react-barcode";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

interface Props {
  data: AssetData[];
}

export const DataTable: React.FC<Props> = ({ data }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState<number[]>([]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const currentData = data.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );


  const handleSelectRow = (index: number) => {
    setSelected((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
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
    <Paper sx={{ width: "100%", overflow: "hidden", mt: 2, mb: 2 }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selected.length > 0 && selected.length < currentData.length
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
              const realIndex = page * rowsPerPage + index + 1;
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
                  <TableCell sx={{ display: "flex" }}>
                    <IconButton aria-label="edit" color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton aria-label="delete" color="primary">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
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
  );
};
