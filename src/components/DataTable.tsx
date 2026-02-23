import { useState, useMemo } from "react";
import { type AssetData } from "../types";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  type MRT_RowSelectionState,
} from "material-react-table";
import { Paper, Chip, IconButton, Box, Button } from "@mui/material";
import Barcode from "react-barcode";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";

interface Props {
  data: AssetData[];
  onEdit?: (asset: AssetData) => void;
  onDelete?: (staffID: string) => void;
  onBulkDelete?: (staffIDs: string[]) => void;
}

export const DataTable: React.FC<Props> = ({
  data,
  onEdit,
  onDelete,
  onBulkDelete,
}) => {
  const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});

  const columns = useMemo<MRT_ColumnDef<AssetData>[]>(
    () => [
      {
        accessorFn: (row) => row.no || "-",
        id: "no",
        header: "No.",
        size: 80,
      },
      {
        accessorKey: "staffID",
        header: "Staff ID",
        size: 130,
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue<string>()}
            size="small"
            color="primary"
            variant="outlined"
          />
        ),
      },
      {
        accessorKey: "fullName",
        header: "Name",
        size: 200,
      },
      {
        accessorKey: "organizationName",
        header: "Organization",
        size: 200,
      },
      {
        id: "barcode",
        header: "Barcode",
        size: 250,
        enableColumnFilter: false,
        enableSorting: false,
        Cell: ({ row }) => {
          const { organizationName, staffID, fullName } = row.original;
          return (
            <Barcode
              value={`${organizationName} ${staffID} ${fullName}`}
              width={1}
              height={30}
              fontSize={14}
              displayValue={false}
              margin={0}
            />
          );
        },
      },
      {
        accessorKey: "modifiedAt",
        header: "Modified At",
        size: 180,
        Cell: ({ cell }) => {
          const val = cell.getValue<number | string>();
          if (!val) return "-";
          return new Date(val).toLocaleString("th-TH");
        },
      },
      {
        id: "actions",
        header: "Action",
        size: 120,
        enableColumnFilter: false,
        enableSorting: false,
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", gap: "0.5rem" }}>
            <IconButton
              aria-label="edit"
              color="primary"
              size="small"
              onClick={() => onEdit && onEdit(row.original)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              aria-label="delete"
              color="error"
              size="small"
              onClick={() => onDelete && onDelete(row.original.staffID)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ),
      },
    ],
    [onEdit, onDelete],
  );

  const table = useMaterialReactTable({
    columns,
    data,
    enableRowSelection: true,
    getRowId: (row) => row.staffID,
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
    enableColumnFilters: true,
    enableGlobalFilter: true,
    paginationDisplayMode: "pages",
    initialState: {
      sorting: [{ id: "modifiedAt", desc: true }],
    },

    renderTopToolbarCustomActions: ({ table }) => {
      const selectedRows = table.getSelectedRowModel().rows;
      return (
        <Box
          sx={{ display: "flex", gap: "1rem", p: "0.5rem", flexWrap: "wrap" }}
        >
          <Button
            color="error"
            disabled={selectedRows.length === 0}
            onClick={() => {
              const selectedIDs = selectedRows.map(
                (row) => row.original.staffID,
              );
              if (onBulkDelete) {
                onBulkDelete(selectedIDs);
              }
            }}
            startIcon={<DeleteSweepIcon />}
            variant="contained"
          >
            ลบรายการที่เลือก ({selectedRows.length})
          </Button>
        </Box>
      );
    },
  });

  return (
    <Paper sx={{ width: "100%", mt: 2, mb: 2 }}>
      <MaterialReactTable table={table} />
    </Paper>
  );
};
