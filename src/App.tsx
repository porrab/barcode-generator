import { useState, useRef, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { FileUploader } from "./components/FileUploader";
import { DataTable, type DataTableHandle } from "./components/DataTable"; // อย่าลืม import type
import { PrintableSheet } from "./components/PrintableSheet";
import { PdfDocument } from "./components/PdfDocument";
import { type AssetData } from "./types";

// MUI Components
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Button,
  CssBaseline,
  Stack,
  CircularProgress,
  Alert,
  Backdrop, // เพิ่ม Backdrop
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import AddIcon from "@mui/icons-material/Add";

function App() {
  const [data, setData] = useState<AssetData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // --- State สำหรับ Print/PDF ---
  const [isPrinting, setIsPrinting] = useState(false);

  // PDF States
  const [showPdfLoading, setShowPdfLoading] = useState(false);
  const [isPdfReady, setIsPdfReady] = useState(false);

  // --- Refs ---
  const printPromiseResolveRef = useRef<(() => void) | null>(null);
  const componentRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<DataTableHandle>(null);

  // ---  Print Handler (Lazy Render) ---
  useEffect(() => {
    if (isPrinting && printPromiseResolveRef.current) {
      printPromiseResolveRef.current();
    }
  }, [isPrinting]);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "Asset_Barcodes",
    onBeforePrint: () => {
      return new Promise((resolve) => {
        printPromiseResolveRef.current = resolve;
        setIsPrinting(true);
      });
    },
    onAfterPrint: () => {
      setIsPrinting(false);
      printPromiseResolveRef.current = null;
    },
  });

  //PDF Handler ( Backdrop + Delay) ---
  const handlePreparePdf = () => {
    setShowPdfLoading(true); //
    setIsPdfReady(false);

    setTimeout(() => {
      setIsPdfReady(true);
    }, 100);
  };

  // --- Data Handlers ---
  const handleSetData = async (assetData: AssetData[]) => {
    try {
      setIsLoading(true);
      setData(assetData);
      setIsPdfReady(false);
      setShowPdfLoading(false);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      alert(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to clear all data?")) {
      setData([]);
      setIsPdfReady(false);
    }
  };

  const handleAddItem = (newItem: AssetData) => {
    setData((prev) => [...prev, newItem]);
    setIsPdfReady(false);
  };

  const handleEditItem = (index: number, updatedItem: AssetData) => {
    setData((prev) => {
      const newData = [...prev];
      newData[index] = updatedItem;
      return newData;
    });
    setIsPdfReady(false);
  };

  const handleDeleteItem = (index: number) => {
    if (confirm("Are you sure you want to delete this item?")) {
      setData((prev) => prev.filter((_, i) => i !== index));
      setIsPdfReady(false);
    }
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
              color="inherit"
              startIcon={<RestartAltIcon />}
              onClick={handleReset}
            >
              New File
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

                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<AddIcon />}
                      onClick={() => tableRef.current?.openAddForm()}
                    >
                      Add Item
                    </Button>

                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<PrintIcon />}
                      onClick={() => handlePrint()}
                      disabled={isLoading || isPrinting}
                    >
                      {isPrinting ? "Preparing..." : "Print"}
                    </Button>

                    {!isPdfReady ? (
                      <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        startIcon={<DownloadIcon />}
                        onClick={handlePreparePdf}
                        disabled={showPdfLoading}
                      >
                        {showPdfLoading ? "Calculating..." : "Prepare PDF"}
                      </Button>
                    ) : (
                      <PDFDownloadLink
                        document={<PdfDocument data={data} />}
                        fileName="asset_barcodes.pdf"
                        style={{ textDecoration: "none" }}
                      >
                        {({ loading }) => {
                          if (!loading && showPdfLoading) {
                            setTimeout(() => setShowPdfLoading(false), 0);
                          }
                          return (
                            <Button
                              variant="contained"
                              color="success"
                              size="large"
                              startIcon={<DownloadIcon />}
                              disabled={loading}
                            >
                              {loading ? "Generating..." : "Download File"}
                            </Button>
                          );
                        }}
                      </PDFDownloadLink>
                    )}

                    {isPdfReady && (
                      <Button
                        onClick={() => {
                          setIsPdfReady(false);
                          setShowPdfLoading(false);
                        }}
                        color="error"
                      >
                        Reset PDF
                      </Button>
                    )}
                  </Stack>
                </Stack>

                <Alert severity="success" sx={{ mb: 2 }}>
                  Data ready. You can now send it to a printer or download the
                  PDF.
                </Alert>

                <DataTable
                  ref={tableRef}
                  data={data}
                  onAdd={handleAddItem}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                />
              </Box>
            )}
          </Box>
        )}

        <div style={{ display: "none" }}>
          {isPrinting && <PrintableSheet ref={componentRef} data={data} />}
        </div>
      </Container>

      {/* Backdrop PDF */}
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={showPdfLoading}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress color="inherit" />
          <Typography variant="h6">Generating PDF... Please wait</Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            (Large datasets may freeze the screen momentarily)
          </Typography>
        </Stack>
      </Backdrop>
    </>
  );
}

export default App;
