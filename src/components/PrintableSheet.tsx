import React from "react";
import { type AssetData } from "../types";
import Barcode from "react-barcode";

interface Props {
  data: AssetData[];
}

export const PrintableSheet = React.forwardRef<HTMLDivElement, Props>(
  ({ data }, ref) => {
    return (
      <div
        ref={ref}
        className="print-container"
        style={{ padding: "20px", background: "white" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
          }}
        >
          {data.map((item, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #000",
                padding: "10px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                pageBreakInside: "avoid",
                overflow: "hidden",
              }}
            >
              <div style={{ maxWidth: "100%", overflow: "hidden" }}>
                <Barcode
                  value={`${item["Organization Name"]} ${item["Staff ID"]} ${item["Full Name"]}`}
                  width={1.2}
                  height={40}
                  fontSize={14}
                  displayValue={false}
                  margin={0}
                />
              </div>

              <div
                style={{
                  marginTop: "5px",
                  fontSize: "12px",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "100%",
                  fontFamily: "monospace",
                  display: "flex",
                  gap: "4px",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontWeight: "bold" }}>
                  {item["Organization Name"]}
                </span>
                <span>{item["Staff ID"]}</span>
                <span>{item["Full Name"]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
);

PrintableSheet.displayName = "PrintableSheet";
