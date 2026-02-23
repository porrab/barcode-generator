import { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { FileUploader } from "./components/FileUploader";
import { DataTable } from "./components/DataTable";
import { PrintableSheet } from "./components/PrintableSheet";
import { PdfDocument } from "./components/PdfDocument";
import { type AssetData } from "./types";
import { FeedbackModal, type ModalType } from "./components/FeedbackModal";

import { useLiveQuery } from "dexie-react-hooks";
import {
  db,
  bulkSaveAssets,
  clearAllAssets,
  deleteAsset,
  bulkDeleteAssets,
  saveAsset,
} from "./db";

import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
  CssBaseline,
  Alert,
  Stack,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { EditAssetModal } from "./components/EditAssetModal";

function App() {
  const dbData = useLiveQuery(() => db.assets.toArray());
  const data = dbData || [];

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const componentRef = useRef<HTMLDivElement>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingAsset, setEditingAsset] = useState<AssetData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    type: ModalType;
    title: string;
    message: string;
  }>({
    type: "info",
    title: "",
    message: "",
  });
  const [onConfirmAction, setOnConfirmAction] = useState<
    (() => void) | undefined
  >(undefined);

  const showModal = (
    type: ModalType,
    title: string,
    message: string,
    onConfirm?: () => void,
  ) => {
    setModalConfig({ type, title, message });
    setOnConfirmAction(() => onConfirm);
    setModalOpen(true);
  };

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "Asset_Barcode",
  });

  const handleSetData = async (assetData: AssetData[]) => {
    try {
      setIsLoading(true);
      await bulkSaveAssets(assetData);
      setIsUploadModalOpen(false);
      showModal(
        "success",
        "Success!",
        `นำเข้าข้อมูลจำนวน ${assetData.length} รายการสำเร็จแล้ว`,
      );
    } catch (error) {
      showModal("error", "Error!", `เกิดข้อผิดพลาดในการบันทึกข้อมูล: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = () => {
    showModal(
      "confirm",
      "Clear All Data?",
      "คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลทั้งหมด? การกระทำนี้ไม่สามารถย้อนกลับได้",
      async () => {
        try {
          await clearAllAssets();
          showModal("success", "Cleared!", "ล้างข้อมูลทั้งหมดเรียบร้อยแล้ว");
        } catch (error) {
          showModal(
            "error",
            "Error!",
            `เกิดข้อผิดพลาดในการล้างข้อมูล: ${error}`,
          );
        }
      },
    );
  };

  const handleEditRow = (asset: AssetData) => {
    setEditingAsset(asset);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (updatedAsset: AssetData) => {
    try {
      await saveAsset(updatedAsset);
      showModal("success", "Updated!", "อัปเดตข้อมูลสำเร็จเรียบร้อย");
    } catch (error) {
      showModal("error", "Error!", `เกิดข้อผิดพลาดในการอัปเดตข้อมูล: ${error}`);
      throw error;
    }
  };

  const handleDeleteRow = (staffID: string) => {
    showModal(
      "confirm",
      "Delete Item?",
      `คุณต้องการลบข้อมูลรหัส ${staffID} ใช่หรือไม่?`,
      async () => {
        try {
          await deleteAsset(staffID);
        } catch (error) {
          showModal("error", "Error!", `เกิดข้อผิดพลาดในการลบ: ${error}`);
        }
      },
    );
  };

  const handleBulkDelete = (staffIDs: string[]) => {
    showModal(
      "confirm",
      "Delete Selected?",
      `คุณต้องการลบข้อมูลที่เลือกจำนวน ${staffIDs.length} รายการใช่หรือไม่?`,
      async () => {
        try {
          await bulkDeleteAssets(staffIDs);
        } catch (error) {
          showModal("error", "Error!", `เกิดข้อผิดพลาดในการลบข้อมูล: ${error}`);
        }
      },
    );
  };

  return (
    <>
      <CssBaseline />
      <AppBar position="static" elevation={0} sx={{ bgcolor: "#2c3e50" }}>
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: "bold" }}
          >
            Asset Barcode Generator
          </Typography>
          {data.length > 0 && (
            <Button
              color="error"
              variant="contained"
              disableElevation
              startIcon={<DeleteSweepIcon />}
              onClick={handleClearData}
              sx={{ bgcolor: "#e74c3c", "&:hover": { bgcolor: "#c0392b" } }}
            >
              Clear Data
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" mt={10}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {data.length === 0 ? (
              <Box sx={{ mt: 4 }}>
                <FileUploader onDataLoaded={handleSetData} />
              </Box>
            ) : (
              <Box>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Box>
                    <Typography variant="h5" fontWeight="bold">
                      Preview Data
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Found {data.length} items
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="large"
                      startIcon={<AddIcon />}
                      onClick={() => setIsUploadModalOpen(true)}
                    >
                      Add Files
                    </Button>

                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<PrintIcon />}
                      onClick={() => handlePrint()}
                    >
                      Print
                    </Button>

                    {/* Save PDF */}
                    <PDFDownloadLink
                      document={<PdfDocument data={data} />}
                      fileName="asset_barcodes.pdf"
                      style={{ textDecoration: "none" }}
                    >
                      {({ loading }) => (
                        <Button
                          variant="contained"
                          color="primary"
                          size="large"
                          startIcon={
                            loading ? (
                              <CircularProgress size={20} color="inherit" />
                            ) : (
                              <DownloadIcon />
                            )
                          }
                          disabled={loading}
                        >
                          {loading ? "Preparing PDF..." : "Save PDF"}
                        </Button>
                      )}
                    </PDFDownloadLink>
                  </Stack>
                </Stack>

                <Alert severity="success" sx={{ mb: 2 }}>
                  Data ready. You can now send it to a printer, download the
                  PDF, or add more files.
                </Alert>

                <DataTable
                  data={data}
                  onEdit={handleEditRow}
                  onDelete={handleDeleteRow}
                  onBulkDelete={handleBulkDelete}
                />
              </Box>
            )}
          </Box>
        )}

        <Box sx={{ display: "none" }}>
          <PrintableSheet ref={componentRef} data={data} />
        </Box>
      </Container>

      <Dialog
        open={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Upload Additional Data
          <IconButton
            aria-label="close"
            onClick={() => setIsUploadModalOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <FileUploader onDataLoaded={handleSetData} />
        </DialogContent>
      </Dialog>
      <EditAssetModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        asset={editingAsset}
        onSave={handleSaveEdit}
      />
      <FeedbackModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={onConfirmAction}
      />
    </>
  );
}

export default App;
