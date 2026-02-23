import React, { useState } from "react";
import ExcelJS from "exceljs";
import Papa from "papaparse";
import { type AssetData } from "../types";
import {
  Box,
  Typography,
  Paper,
  styled,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

interface Props {
  onDataLoaded: (data: AssetData[]) => void;
}

const UploadBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(6),
  textAlign: "center",
  cursor: "pointer",
  border: `2px dashed ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.default,
  transition: "all 0.3s ease",
  "&:hover": {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
    transform: "translateY(-2px)",
  },
}));

const cleanValue = (val: any): string => {
  if (val === null || val === undefined) return "";
  if (typeof val === "object") {
    if (val.text) return String(val.text);
    if (val.result) return String(val.result);
    return "";
  }
  return String(val).trim();
};

export const FileUploader: React.FC<Props> = ({ onDataLoaded }) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const processData = (rawData: any[]) => {
    const processed: AssetData[] = [];

    rawData.forEach((row: any) => {
      const getCol = (keys: string[]) => {
        for (const k of keys) {
          const foundKey = Object.keys(row).find(
            (rk) => rk.toLowerCase().trim() === k.toLowerCase(),
          );
          if (foundKey) return row[foundKey];
        }
        return "";
      };

      const no = row["No"] || row["No."];
      const org = getCol(["Organization Name", "Org", "Organization"]);
      const staffId = getCol(["Staff ID", "ID", "Employee ID"]);
      const fullName = getCol(["Full Name", "Name", "Staff Name"]);

      if (staffId || fullName) {
        processed.push({
          no: Number(no) || "",
          organizationName: cleanValue(org),
          staffID: cleanValue(staffId),
          fullName: cleanValue(fullName),
        });
      }
    });

    if (processed.length === 0) {
      setErrorMsg(
        "ไม่พบข้อมูลที่ถูกต้อง (ตรวจสอบชื่อหัวตาราง: Staff ID, Full Name)",
      );
    } else {
      onDataLoaded(processed);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setErrorMsg(null);
    console.log("Processing file:", file.name);

    try {
      if (
        file.name.toLowerCase().endsWith(".csv") ||
        file.type === "text/csv"
      ) {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            console.log("CSV Parsed:", results.data);
            processData(results.data);
            setLoading(false);
          },
          error: (err) => {
            setErrorMsg(`CSV Error: ${err.message}`);
            setLoading(false);
          },
        });
      } else if (file.name.toLowerCase().endsWith(".xlsx")) {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);

        const worksheet = workbook.worksheets[0];
        if (!worksheet) throw new Error("No worksheet found");

        const excelData: any[] = [];

        const headers: string[] = [];
        worksheet.getRow(1).eachCell((cell, colNumber) => {
          headers[colNumber] = cleanValue(cell.value);
        });

        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return;
          const rowObj: any = {};
          row.eachCell((cell, colNumber) => {
            const header = headers[colNumber];
            if (header) {
              rowObj[header] = cell.value;
            }
          });
          excelData.push(rowObj);
        });

        console.log("Excel Parsed:", excelData);
        processData(excelData);
        setLoading(false);
      } else {
        throw new Error("รองรับเฉพาะไฟล์ .csv หรือ .xlsx เท่านั้น");
      }
    } catch (error) {
      console.error("Upload Error:", error);
      setErrorMsg(
        "เกิดข้อผิดพลาด: " +
          (error instanceof Error ? error.message : String(error)),
      );
      setLoading(false);
    } finally {
      e.target.value = "";
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
      <Snackbar
        open={!!errorMsg}
        autoHideDuration={6000}
        onClose={() => setErrorMsg(null)}
      >
        <Alert severity="error">{errorMsg}</Alert>
      </Snackbar>

      <label htmlFor="upload-file">
        <input
          accept=".xlsx, .csv"
          style={{ display: "none" }}
          id="upload-file"
          type="file"
          onChange={handleFileUpload}
        />
        <UploadBox elevation={0}>
          {loading ? (
            <CircularProgress size={60} sx={{ mb: 2 }} />
          ) : (
            <CloudUploadIcon
              sx={{ fontSize: 60, color: "primary.main", mb: 2 }}
            />
          )}
          <Typography variant="h6" color="textPrimary" gutterBottom>
            {loading ? "Processing..." : "Upload File"}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Supports both <b>.xlsx</b> (Excel) and <b>.csv</b>
          </Typography>
        </UploadBox>
      </label>
    </Box>
  );
};
