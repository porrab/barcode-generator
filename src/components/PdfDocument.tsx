import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { type AssetData } from "../types";
import jsBarcode from "jsbarcode";

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: "Helvetica",
  },

  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: "#999",
    borderStyle: "dashed",
  },

  card: {
    width: "50%",
    height: 80,
    padding: 4,
    alignItems: "center",
    justifyContent: "center",

    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#999",
    borderStyle: "dashed",
  },
  barcodeImage: {
    width: 250,
    height: 40,
    marginBottom: 5,
  },
  textContainer: {
    marginTop: 3,
    alignItems: "center",
  },
  textRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  text: {
    fontSize: 10,
    color: "#333",
  },
  bold: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000",
  },
  subText: {
    fontSize: 9,
    color: "#555",
    marginTop: 2,
  },
});

const generateBarcodeDataUrl = (text: string) => {
  const canvas = document.createElement("canvas");
  jsBarcode(canvas, text, {
    format: "CODE128",
    displayValue: false,
    width: 2,
    height: 40,
    margin: 0,
  });
  return canvas.toDataURL("image/png");
};

interface Props {
  data: AssetData[];
}

export const PdfDocument: React.FC<Props> = ({ data }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.gridContainer}>
          {data.map((item, index) => {
            const barcodeUrl = generateBarcodeDataUrl(
              `${item["Organization Name"]} ${item["Staff ID"]} ${item["Full Name"]}`,
            );

            return (
              <View key={index} style={styles.card} wrap={false}>
                <Image src={barcodeUrl} style={styles.barcodeImage} />

                <View style={styles.textContainer}>
                  <View style={styles.textRow}>
                    <Text style={styles.subText}>
                      {item["Organization Name"]}
                    </Text>
                    <Text style={styles.subText}>{item["Staff ID"]}</Text>
                    <Text style={styles.subText}>{item["Full Name"]}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </Page>
    </Document>
  );
};
