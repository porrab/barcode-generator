import { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { FileUploader } from "./components/FileUploader";
import { DataTable } from "./components/DataTable";
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
  Alert,
  Stack,
  CircularProgress,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download"; // Icon Download
import RestartAltIcon from "@mui/icons-material/RestartAlt";

function App() {
  const [data, setData] = useState<AssetData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: "Asset_Barcodes",
  });

  const handleSetData = async (assetData: AssetData[]) => {
    try {
      setIsLoading(true);
      setData(assetData);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      alert(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setData([]);
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
                      variant="outlined"
                      size="large"
                      startIcon={<PrintIcon />}
                      onClick={() => handlePrint()}
                    >
                      Print
                    </Button>

                    {/*Save PDF  */}
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
                  Data ready You can now send it to a printer or download the
                  PDF file directly.
                </Alert>

                <DataTable data={data} />
              </Box>
            )}
          </Box>
        )}

        <Box sx={{ display: "none" }}>
          <PrintableSheet ref={componentRef} data={data} />
        </Box>
      </Container>
    </>
  );
}

export default App;
